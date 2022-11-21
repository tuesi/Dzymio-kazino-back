const { setBet, setBetToMessage, setClientBetOutcomeMessage, sendClientBetOutomeWithCoefficient } = require('../services/sharedFunctionService');
const BetResponseObject = require('../objects/betResponseObject');

var io;
crashRoom = 'crash';

var crashNumber = 1.00;
var ableToBet = true;
var ableToStop = true;
var spinTimer = 0;

previousCrashResults = [];
crashClientMessages = [];
crashBets = [];

mainNumberProbability = [];
mainNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10];
//                           2    3    4   5   6   7   8   9  10
mainNumbersProbabilities = [100, 100, 75, 60, 50, 30, 20, 10, 5];

function crashSockets(crashIo) {
    io = crashIo;
    setUpNumberProbabilities();
    timeBetweenSpins();
}

function initialCrashRoomEvent(socket) {
    socket.emit('timeTillSpin', spinTimer);
    socket.emit('initialButtonState', ableToBet);
    socket.emit('clientBetHistory', crashClientMessages);
}

function setUpNumberProbabilities() {
    for (let i = 0; i < mainNumbersProbabilities.length; i++) {
        for (let y = 0; y < mainNumbersProbabilities[i]; y++) {
            mainNumberProbability.push(mainNumbers[i]);
        }
    }
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
                getClientToStopCrash(socket, crashNumber);
            }
            break;
    }
}

function moveCrash() {
    var precision = 100; // 2 decimals
    var mainNumberIndex = (Math.floor(Math.random() * mainNumberProbability.length));
    var mainNumber = mainNumberProbability[mainNumberIndex];
    var randomnum = Math.floor(Math.random() * (mainNumber * precision - 1 * precision) + 1 * precision) / (1 * precision);
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
            checkForCrashStop(crashNumber);
        }
    }, 60)
}

function timeBetweenSpins() {
    spinTimer = timeTillnextSpin;
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
    io.in(lineRoom).emit('newRound', true);
}

function sendPreviousCrashResults() {
    io.to(crashRoom).emit('previousResults', previousCrashResults);
}

async function setCrashBet(socket, clientBet) {
    let newBet = await setBet(socket.id, clientBet, null, 'CRASH');
    crashBets.push(newBet);
    crashClientMessages = setBetToMessage(newBet, crashClientMessages);
    io.in(crashRoom).emit('clientBetHistory', crashClientMessages);
}

function checkForCrashStop(currentCrashNumber) {
    crashBets.forEach((bet, index) => {
        console.log(currentCrashNumber.toString() >= bet.prediction);
        if (currentCrashNumber.toString() >= bet.prediction) {
            console.log(index);
            stopCrash(index, currentCrashNumber);
        }
    })
}

function getClientToStopCrash(socket, currentCrashNumber) {
    const clientBetIndex = crashBets.findIndex(bet => bet.socketId === socket.id);
    if (clientBetIndex !== -1) stopCrash(clientBetIndex, currentCrashNumber);
}

async function stopCrash(index, currentCrashNumber) {
    // send response to jimmy api with crashNumber
    crashBets[index].betCoefficient = currentCrashNumber;
    sendClientBetOutomeWithCoefficient(crashBets[index], true, currentCrashNumber);
    let betMessage = setClientBetOutcomeMessage(crashBets[index], true);
    // add win response to client messages
    crashClientMessages.push(betMessage);
    // send win response to client
    sendBetWinResultToclient(crashBets[index], currentCrashNumber);
    //send win message to room
    io.in(crashRoom).emit('clientBetHistory', crashClientMessages);
    crashBets.splice(index, 1);

    // remove bet object with current client socket id
    // bets that are left in the crashBets are the people who lost
    // send lost responses to socket ids that are left
    // add lost messages to clientMessages
}

function sendBetWinResultToclient(bet, stopCrashNumber) {
    const response = new BetResponseObject();
    response.status = true;
    response.amount = Math.floor(bet.betAmount * stopCrashNumber);
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

function getLostClientStatusToMessage() {
    crashBets.forEach(bet => {
        bet.betCoefficient = 0;
        sendClientBetOutomeWithCoefficient(bet, false, 0);
        let betMessage = setClientBetOutcomeMessage(bet, false);
        crashClientMessages.push(betMessage);
    });
    io.in(crashRoom).emit('clientBetHistory', crashClientMessages);
    crashBets = [];
}

module.exports = { crashSockets, crashRoomEvents, initialCrashRoomEvent };