const { setBet, setBetToMessage, setClientBetOutcomeAndGetMessage } = require('../services/sharedFunctionService');

var io;
crashRoom = 'crash';

var crashNumber = 1.00;
var ableToBet = true;
var ableToStop = true;

previousCrashResults = [];
crashClientMessages = [];
crashBets = [];

function crashSockets(crashIo) {
    io = crashIo;
    timeBetweenSpins();
}

function crashRoomEvents(socket, eventObject) {
    switch (eventObject.event) {
        case 'getPreviousResults':
            socket.emit('previousResults', previousCrashResults);
            break;
        case 'bet':
            if (ableToBet) {
                setCrashBet(socket, eventObject.data);
            } else {
                socket.emit('betError', true);
            }
            break;
        case 'stop':
            if (ableToStop) {
                stopCrash(socket, crashNumber);
            }
            break;
    }
}

function moveCrash() {
    var precision = 100; // 2 decimals
    var randomnum = Math.floor(Math.random() * (10 * precision - 1 * precision) + 1 * precision) / (1 * precision);
    console.log(randomnum);
    const interval = setInterval(() => {
        if (crashNumber >= randomnum - 0.01) {
            ableToStop = false;
            clearInterval(interval);
            setTimeout(() => {
                clearInterval(interval);
                setTimeout(() => {
                    resetRoom();
                }, 5000);
            }, 60)
        } else {
            crashNumber += 0.01;
            io.in(crashRoom).emit('crashValue', crashNumber);
        }
    }, 60)
}

function timeBetweenSpins() {
    let spinTimer = timeTillnextSpin;
    let spinTime = setInterval(function () {
        io.to(crashRoom).emit('timeTillSpin', spinTimer);
        spinTimer--;

        if (spinTimer < 5) {
            ableToBet = false;
            io.to(crashRoom).emit('betTimeEnd', true);
        }

        if (spinTimer < 0) {
            clearInterval(spinTime);
            setTimeout(function () {
                io.to(crashRoom).emit('resetCrash', true);
            }, 120);
            setTimeout(function () {
                moveCrash();
            }, 180);
        }
    }, 1000);
}

function resetRoom() {
    previousCrashResults.push(crashNumber);
    crashNumber = 1.00;
    ableToBet = true;
    ableToStop = true;
    sendBetLostResultToClient();
    getLostClientStatusToMessage();
    sendPreviousCrashResults();
    timeBetweenSpins();
}

function sendPreviousCrashResults() {
    io.to(crashRoom).emit('previousResults', previousCrashResults);
}

async function setCrashBet(socket, clientBet) {
    let newBet = await setBet(socket.id, clientBet, null, 'multyplier');
    crashBets.push(newBet);
    crashClientMessages = setBetToMessage(newBet, crashClientMessages);
    io.in(crashRoom).emit('clientBetHistory', crashClientMessages);
}

async function stopCrash(socket, currentCrashNumber) {
    // find socketId in the crashBets
    const clientBetIndex = crashBets.findIndex(bet => bet.socketId === socket.id);
    if (clientBetIndex !== -1) {
        // send response to jimmy api with crashNumber
        crashBets[clientBetIndex].betCoefficient = currentCrashNumber;
        let betMessage = setClientBetOutcomeAndGetMessage(crashBets[clientBetIndex], true);
        // add win response to client messages
        crashClientMessages.push(betMessage);
        // send win response to client
        sendBetWinResultToclient(currentCrashNumber);
        //send win message to room
        io.in(crashRoom).emit('clientBetHistory', crashClientMessages);
        crashBets.splice(clientBetIndex, 1);
    }

    // remove bet object with current client socket id
    // bets that are left in the crashBets are the people who lost
    // send lost responses to socket ids that are left
    // add lost messages to clientMessages
}

function sendBetWinResultToclient(stopCrashNumber) {
    const response = new BetResponseObject();
    response.status = true;
    response.amount = bet.betAmount * stopCrashNumber;
    io.in(bet.socketId).emit('betStatus', response);
}

function sendBetLostResultToClient() {
    crashBets.forEach(bet => {
        const response = new BetResponseObject();
        response.status = false;
        response.amount = bet.betAmount;
        io.in(bet.socketId).emit('betStatus', response);
    });
}

async function getLostClientStatusToMessage() {
    crashBets.forEach(async bet => {
        bet.betCoefficient = 0;
        let betMessage = setClientBetOutcomeAndGetMessage(bet, false);
        crashClientMessages.push(betMessage);
    });
    io.in(crashRoom).emit('clientBetHistory', crashClientMessages);
}

module.exports = { crashSockets, crashRoomEvents };