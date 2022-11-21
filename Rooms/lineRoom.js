const { setBet, setBetToMessage, sendClientBetOutomeWithCoefficient, setClientBetOutcomeMessage } = require('../services/sharedFunctionService');
const BetResponseObject = require('../objects/betResponseObject');

var io;
lineRoom = 'line';
lineNumber = 0;
move = 0;

var ableToBet = true;
var spinTimer = 0;

lineClientMessages = [];
lineBets = [];
previousLineResults = [];

itemProbability = [];

coeficients = [0, 1, 1.5, 2, 4, 10];

itemProbabilityFactors = [100, 100, 55, 25, 15, 5];

function lineSockets(lineIo) {
    io = lineIo;
    setUpItemCoefficients();
    timeBetweenSpins();
}

function initialLineRoomEvent(socket) {
    socket.emit('initialLinePos', move);
    socket.emit('timeTillSpin', spinTimer);
    socket.emit('initialButtonState', ableToBet);
    socket.emit('clientBetHistory', lineClientMessages);
}

function lineRoomEvents(socket, eventObject) {
    switch (eventObject.event) {
        case 'getPreviousResults':
            socket.emit('previousLineResults', previousLineResults);
            break;
        case 'bet':
            if (ableToBet) {
                setLineBet(socket, eventObject.data);
            } else {
                socket.emit('betError', true);
            }
            break;
    }
}

function setUpItemCoefficients() {
    for (let i = 0; i < itemProbabilityFactors.length; i++) {
        for (let y = 0; y < itemProbabilityFactors[i]; y++) {
            itemProbability.push(coeficients[i]);
        }
    }
}

function calculateNumber() {
    let itemList = [];
    for (var i = 0; i < 50; i++) {
        if (i == 41) {
            let number = itemProbability[(Math.floor(Math.random() * itemProbability.length))];
            lineNumber = coeficients[number];
            previousLineResults.push(lineNumber);
            itemList.push(number);
        }
        itemList.push(itemProbability[(Math.floor(Math.random() * itemProbability.length))]);
    }
    io.to(lineRoom).emit('lineSet', itemList);
    setTimeout(() => {
        spin();
    }, 50);
}

function spin() {
    move = 0;
    const endPos = Math.floor(Math.random() * 180);
    const interval = setInterval(() => {
        //Dabar vienas yra mazdaug 200
        if (move < (9170 - endPos)) {
            //9150
            //8990 nuo 
            //9170 iki
            io.in(lineRoom).emit('linePos', move);
            move += 50;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                resetRoom();
            }, 5000);
        }
    }, 5)
}

function resetRoom() {
    ableToBet = true;
    sendBetResultToClient();
    getClientStatusToMessage();
    sendPreviousLineResults();
    timeBetweenSpins();
    io.in(lineRoom).emit('newRound', true);
}

function timeBetweenSpins() {
    spinTimer = timeTillnextSpin;
    let spinTime = setInterval(function () {
        io.to(lineRoom).emit('timeTillSpin', spinTimer);
        spinTimer--;

        if (spinTimer < 5) {
            ableToBet = false;
            io.to(lineRoom).emit('betTimeEnd', true);
        }

        if (spinTimer < 0) {
            clearInterval(spinTime);
            setTimeout(function () {
                calculateNumber();
            }, 180);
        }
    }, 1000);
}

function sendPreviousLineResults() {
    io.to(lineRoom).emit('previousLineResults', previousLineResults);
}

async function setLineBet(socket, clientBet) {
    let newBet = await setBet(socket.id, clientBet, null, 'MULTIPLIER');
    lineBets.push(newBet);
    lineClientMessages = setBetToMessage(newBet, lineClientMessages);
    io.in(lineRoom).emit('clientBetHistory', lineClientMessages);
}

function sendBetResultToClient() {
    lineBets.forEach(bet => {
        const response = new BetResponseObject();
        response.status = lineNumber == 0 ? false : true;
        response.amount = bet.betAmount * lineNumber;
        io.in(bet.socketId).emit('betStatus', response);
    });
}

function getClientStatusToMessage() {
    lineBets.forEach(bet => {
        bet.betCoefficient = lineNumber;
        sendClientBetOutomeWithCoefficient(bet, lineNumber == 0 ? false : true, lineNumber);
        let betMessage = setClientBetOutcomeMessage(bet, lineNumber == 0 ? false : true);
        lineClientMessages.push(betMessage);
    });
    io.in(lineRoom).emit('clientBetHistory', lineClientMessages);
    lineBets = [];
}

module.exports = { lineSockets, lineRoomEvents, initialLineRoomEvent };