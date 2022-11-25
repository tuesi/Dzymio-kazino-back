const { setBet, setBetToMessage, sendClientBetOutomeWithCoefficient, setClientBetOutcomeMessage, cleanUpList } = require('../services/sharedFunctionService');
const BetResponseObject = require('../objects/betResponseObject');

var io;
var lineRoom = 'line';
var lineNumber = 0;
var move = 0;
var itemList = [];

var timeTillnextSpin = process.env.TIMER_IN_SECONDS;

var currentDaySpin = 1;
var currentDate = new Date();

var ableToBet = true;
var spinTimer = 0;

var lineClientMessages = [];
var lineBets = [];
var previousLineResults = [];

var itemProbability = [];

var coeficients = [0, 1, 1.5, 2, 4, 10];

var itemProbabilityFactors = [100, 100, 55, 25, 15, 5];

function lineSockets(lineIo) {
    io = lineIo;
    currentDate = new Date().toLocaleDateString("lt");
    setUpItemCoefficients();
    timeBetweenSpins();
}

function initialLineRoomEvent(socket) {
    socket.emit('lineSet', itemList);
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
    itemList = [];
    for (var i = 0; i < 50; i++) {
        if (i == 41) {
            let number = itemProbability[(Math.floor(Math.random() * itemProbability.length))];
            lineNumber = coeficients[coeficients.indexOf(number)];
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
    move = 85;
    const endPos = Math.floor(Math.random() * 96);
    const interval = setInterval(() => {
        //Dabar vienas yra mazdaug 95
        if (move < (4360 - endPos)) {
            //4265 nuo 
            //4360 iki
            io.in(lineRoom).emit('linePos', move);
            move += 5;
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
    currentDaySpinAmount();
    io.in(lineRoom).emit('newRound', true);
}

function currentDaySpinAmount() {
    if (currentDate < new Date().toLocaleDateString("lt")) {
        currentDaySpin = 1;
        currentDate = new Date().toLocaleDateString("lt");
    } else {
        currentDaySpin++;
    }
    let currentSpinMessage = { clientId: null, avatar: null, message: currentDaySpin.toString() + " sukimas" };
    lineClientMessages.push(currentSpinMessage);
    lineClientMessages = cleanUpList(100, lineClientMessages);
    io.in(lineRoom).emit('clientBetHistory', lineClientMessages);
    io.in(lineRoom).emit('currentSpinNo', currentDaySpin);
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
    previousLineResults.push(lineNumber);
    previousLineResults = cleanUpList(20, previousLineResults);
    io.to(lineRoom).emit('previousLineResults', previousLineResults);
}

async function setLineBet(socket, clientBet) {
    let newBet = await setBet(socket.id, clientBet, null, 'MULTIPLIER');
    lineBets.push(newBet);
    lineClientMessages = setBetToMessage(newBet, lineClientMessages);
    lineClientMessages = cleanUpList(100, lineClientMessages);
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
        lineClientMessages = cleanUpList(100, lineClientMessages);
    });
    io.in(lineRoom).emit('clientBetHistory', lineClientMessages);
    lineBets = [];
}

module.exports = { lineSockets, lineRoomEvents, initialLineRoomEvent };