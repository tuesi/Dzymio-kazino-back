const { setBet, setBetToMessage, sendClientBetOutomeWithCoefficient, setClientBetOutcomeMessage, cleanUpList, checkClientLives, cancelBet, setClientBetMutualOutcomeMessage, checkAndRemoveClientLives } = require('../services/sharedFunctionService');
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
var nonWinnableProbability = [];
var noonePlayingProbability = [];

var coeficients = [0, 1, 1.5, 2, 4, 10];

var itemProbabilityFactors = [300, 100, 50, 25, 15, 2];

var nonWinnableItemProbabilities = [100, 100, 80, 80, 50, 5];

var noonePlayingFactors = [350, 100, 100, 100, 100, 10];

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

function checkIfThereIsPeopleInRoom() {
    if (io.sockets.adapter.rooms.get(lineRoom)) {
        return true;
    } else {
        return false;
    }
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


    //NON WINNABLE
    for (let i = 0; i < nonWinnableItemProbabilities.length; i++) {
        for (let y = 0; y < nonWinnableItemProbabilities[i]; y++) {
            nonWinnableProbability.push(coeficients[i]);
        }
    }

    //EMPTY
    for (let i = 0; i < noonePlayingFactors.length; i++) {
        for (let y = 0; y < noonePlayingFactors[i]; y++) {
            noonePlayingProbability.push(coeficients[i]);
        }
    }
}

function calculateNumber() {
    itemList = [];
    for (var i = 0; i < 50; i++) {
        if (i == 41) {
            if (lineBets.length > 0) {
                let number = itemProbability[(Math.floor(Math.random() * itemProbability.length))];
                lineNumber = coeficients[coeficients.indexOf(number)];
                itemList.push(number);
            } else {
                let number = noonePlayingProbability[(Math.floor(Math.random() * noonePlayingProbability.length))];
                lineNumber = coeficients[coeficients.indexOf(number)];
                itemList.push(number);
            }
        }
        itemList.push(nonWinnableProbability[(Math.floor(Math.random() * nonWinnableProbability.length))]);
    }
    if (checkIfThereIsPeopleInRoom()) io.to(lineRoom).emit('lineSet', itemList);
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
            if (checkIfThereIsPeopleInRoom()) io.in(lineRoom).emit('linePos', move);
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
    if (checkIfThereIsPeopleInRoom()) io.in(lineRoom).emit('newRound', true);
}

async function currentDaySpinAmount() {
    if (currentDate < new Date().toLocaleDateString("lt")) {
        currentDaySpin = 1;
        currentDate = new Date().toLocaleDateString("lt");
    } else {
        currentDaySpin++;
    }
    let currentSpinMessage = { clientId: null, avatar: null, message: currentDaySpin.toString() + " sukimas" };
    lineClientMessages.push(currentSpinMessage);
    lineClientMessages = cleanUpList(100, lineClientMessages);
    if (checkIfThereIsPeopleInRoom()) io.in(lineRoom).emit('clientBetHistory', lineClientMessages);
    if (checkIfThereIsPeopleInRoom()) io.in(lineRoom).emit('currentSpinNo', currentDaySpin);
}

function timeBetweenSpins() {
    spinTimer = timeTillnextSpin;
    let spinTime = setInterval(function () {
        if (checkIfThereIsPeopleInRoom()) io.to(lineRoom).emit('timeTillSpin', spinTimer);
        spinTimer--;

        if (spinTimer < 5) {
            ableToBet = false;
            if (checkIfThereIsPeopleInRoom()) io.to(lineRoom).emit('betTimeEnd', true);
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
    if (checkIfThereIsPeopleInRoom()) io.to(lineRoom).emit('previousLineResults', previousLineResults);
}

async function setLineBet(socket, clientBet) {
    if (!lineBets.some(bet => bet.clientId === clientBet.clientId)) {
        let newBet = await setBet(socket.id, clientBet, null, 'MULTIPLIER', io);
        lineBets.push(newBet);
        lineClientMessages = setBetToMessage(newBet, lineClientMessages);
        lineClientMessages = cleanUpList(100, lineClientMessages);
        if (checkIfThereIsPeopleInRoom()) io.in(lineRoom).emit('clientBetHistory', lineClientMessages);
    }
}

function sendBetResultToClient() {
    lineBets.forEach(async bet => {
        const response = new BetResponseObject();
        if (lineNumber == 0 && await checkClientLives(bet.clientId)) {
            response.status = true;
            response.amount = 0;
        } else {
            response.status = lineNumber == 0 ? false : true;
            if (lineNumber == 0) {
                response.amount = bet.betAmount
            } else {
                response.amount = bet.betAmount * lineNumber;
            }
        }
        io.in(bet.socketId).emit('betStatus', response);
    });
}

function getClientStatusToMessage() {
    var count = 0;
    lineBets.forEach(async (bet, index, array) => {
        if ((lineNumber == 0 && await checkAndRemoveClientLives(bet.clientId))) {
            const betOutcome = await cancelBet(bet, io);
            bet.betAmount = betOutcome;
            const betMessage = await setClientBetMutualOutcomeMessage(bet);
            lineClientMessages.push(betMessage);
            lineClientMessages = cleanUpList(100, lineClientMessages)
        } else {
            bet.betCoefficient = lineNumber;
            let betMessage;
            if (lineNumber == 1) {
                sendClientBetOutomeWithCoefficient(bet, lineNumber == 0 ? false : true, lineNumber, io, false);
                betMessage = await setClientBetMutualOutcomeMessage(bet);
            } else {
                sendClientBetOutomeWithCoefficient(bet, lineNumber == 0 ? false : true, lineNumber, io);
                betMessage = setClientBetOutcomeMessage(bet, lineNumber == 0 ? false : true);
            }
            lineClientMessages.push(betMessage);
            lineClientMessages = cleanUpList(100, lineClientMessages);
        }
        count++;
        if (count === array.length) {
            await currentDaySpinAmount();
        }
    });
    if (!(lineBets.length > 0)) {
        currentDaySpinAmount();
    }
    lineBets = [];
}

module.exports = { lineSockets, lineRoomEvents, initialLineRoomEvent };