const { setBet, setBetToMessage, setClientBetOutcomeMessage, sendClientBetOutome, cleanUpList, checkClientLives, cancelBet, setClientBetMutualOutcomeMessage, checkAndRemoveClientLives } = require('../services/sharedFunctionService');
const BetResponseObject = require('../objects/betResponseObject');

var io;
var higherLowerRoom = 'higherLower';

var number = 50;
var previousHigherLower = [];
var higherLowerBets = [];
var higherLowerClientMessages = [];
var ableToBet = true;
var spinTimer = 0;

var nextNumber = number;
var currentNumber = number;
var previousNumber = number;

var betWinAmount = 2;

var timeTillnextSpin = process.env.TIMER_IN_SECONDS;

var currentDaySpin = 1;
var currentDate = new Date();

function higherLowerSockets(higherLowerIo) {
    io = higherLowerIo;
    currentDate = new Date().toLocaleDateString("lt");
    timeBetweenSpins();
}

function initialHigherLowerRoomEvent(socket) {
    socket.emit('timeTillSpin', spinTimer);
    socket.emit('initialButtonState', ableToBet);
    socket.emit('clientBetHistory', higherLowerClientMessages);
    socket.emit('initialHigherLowerPos', currentNumber);
}

function checkIfThereIsPeopleInRoom() {
    if (io.sockets.adapter.rooms.get(higherLowerRoom)) {
        return true;
    } else {
        return false;
    }
}

function higherLowerRoomEvents(socket, eventObject) {
    switch (eventObject.event) {
        case 'getPreviousResults':
            socket.emit('previousHigherLower', previousHigherLower);
            break;
        case 'bet':
            if (ableToBet) {
                setHigherLowerBet(socket, eventObject.data);
            } else {
                socket.emit('betError', true);
            }
            break;
    }
}

function calculateNumber() {
    previousNumber = currentNumber;
    currentNumber = nextNumber;
    const direction = Math.floor(Math.random() * 3);
    if (direction === 0) {
        nextNumber = currentNumber;
    } else {
        nextNumber = Math.floor(Math.random() * 100) + 1;
    }

}

function sendPreviousHigherLower() {
    previousHigherLower.push(nextNumber);
    previousHigherLower = cleanUpList(20, previousHigherLower);
    if (checkIfThereIsPeopleInRoom()) io.to(higherLowerRoom).emit('previousHigherLower', previousHigherLower);
}

function moveHigherLower() {
    calculateNumber();
    const interval = setInterval(() => {
        if (nextNumber === currentNumber) {
            clearInterval(interval);
            setTimeout(() => {
                clearInterval(interval);
                setTimeout(() => {
                    resetRoom();
                }, 500);
            }, 60)
        } else {
            if (nextNumber > currentNumber) {
                currentNumber += 1;
            } else if (nextNumber < currentNumber) {
                currentNumber -= 1;
            }
            if (checkIfThereIsPeopleInRoom()) io.in(higherLowerRoom).emit('higherLowerValue', currentNumber);
        }
    }, 60)
}

function timeBetweenSpins() {
    spinTimer = timeTillnextSpin;
    let spinTime = setInterval(function () {
        if (checkIfThereIsPeopleInRoom()) io.to(higherLowerRoom).emit('timeTillSpin', spinTimer);
        spinTimer--;

        if (spinTimer < 5) {
            ableToBet = false;
            if (checkIfThereIsPeopleInRoom()) io.to(higherLowerRoom).emit('betTimeEnd', true);
        }

        if (spinTimer < 0) {
            clearInterval(spinTime);
            setTimeout(function () {
                moveHigherLower();
            }, 180);
        }
    }, 1000);
}

function resetRoom() {
    ableToBet = true;
    sendPreviousHigherLower();
    if (checkIfThereIsPeopleInRoom()) io.in(higherLowerRoom).emit('newRound', true);
    sendBetResultToClient();
    getClientStatusToMessage();
    timeBetweenSpins();
}

async function currentDaySpinAmount() {
    if (currentDate < new Date().toLocaleDateString("lt")) {
        currentDaySpin = 1;
        currentDate = new Date().toLocaleDateString("lt");
    } else {
        currentDaySpin++;
    }
    let currentHigherLowerMessage = { clientId: null, avatar: null, message: currentDaySpin.toString() + " sukimas" };
    higherLowerClientMessages.push(currentHigherLowerMessage);
    higherLowerClientMessages = cleanUpList(100, higherLowerClientMessages);
    if (checkIfThereIsPeopleInRoom()) io.in(higherLowerRoom).emit('clientBetHistory', higherLowerClientMessages);
    if (checkIfThereIsPeopleInRoom()) io.in(higherLowerRoom).emit('currentSpinNo', currentDaySpin);
}

async function setHigherLowerBet(socket, clientBet) {
    if (!higherLowerBets.some(bet => bet.clientId === clientBet.clientId)) {
        let newBet = await setBet(socket.id, clientBet, betWinAmount, 'HIGHER_LOWER', io);
        higherLowerBets.push(newBet);
        var betMessage;
        if (newBet.prediction === "0") {
            betMessage = "Tiek pat";
        } else if (newBet.prediction === "1") {
            betMessage = "Daugiau";
        } else if (newBet.prediction === "2") {
            betMessage = "Mažiau";
        }
        higherLowerClientMessages = setBetToMessage(newBet, higherLowerClientMessages, betMessage);
        higherLowerClientMessages = cleanUpList(100, higherLowerClientMessages);
        if (checkIfThereIsPeopleInRoom()) io.in(higherLowerRoom).emit('clientBetHistory', higherLowerClientMessages);
    }
}

async function sendBetResultToClient() {
    higherLowerBets.forEach(async bet => {
        let response = new BetResponseObject();
        var betResult;
        if (currentNumber > previousNumber) {
            betResult = bet.prediction === "1" ? betWinAmount : 0;
        } else if (previousNumber === currentNumber) {
            betResult = bet.prediction === "0" ? betWinAmount : 0;
        } else if (currentNumber < previousNumber) {
            betResult = bet.prediction === "2" ? betWinAmount : 0;
        }
        if (betResult == 0 && await checkClientLives(bet.clientId)) {
            response.status = true;
            response.amount = 0;
        } else {
            response.status = betResult == 0 ? false : true;
            response.amount = (betResult == 0 ? bet.betAmount : bet.betAmount * betResult);
        }
        io.in(bet.socketId).emit('betStatus', response);
    });
}

async function getClientStatusToMessage() {
    var count = 0;
    higherLowerBets.forEach(async (bet, index, array) => {
        var betResult;
        if (currentNumber > previousNumber) {
            betResult = bet.prediction === "1" ? betWinAmount : 0;
        } else if (previousNumber === currentNumber) {
            betResult = bet.prediction === "0" ? betWinAmount : 0;
        } else if (currentNumber < previousNumber) {
            betResult = bet.prediction === "2" ? betWinAmount : 0;
        }
        if (betResult == 0 && await checkAndRemoveClientLives(bet.clientId)) {
            const betOutcome = await cancelBet(bet, io);
            bet.betAmount = betOutcome;
            const betMessage = await setClientBetMutualOutcomeMessage(bet);
            higherLowerClientMessages.push(betMessage);
            higherLowerClientMessages = cleanUpList(100, higherLowerClientMessages);
        } else {
            sendClientBetOutome(bet, betResult == 0 ? false : true, io);
            let betMessage = setClientBetOutcomeMessage(bet, betResult == 0 ? false : true);
            higherLowerClientMessages.push(betMessage);
            higherLowerClientMessages = cleanUpList(100, higherLowerClientMessages);
        }
        count++;
        if (count === array.length) {
            await currentDaySpinAmount();
        }
    });
    if (!(higherLowerBets.length > 0)) {
        currentDaySpinAmount();
    }
    higherLowerBets = [];
}

module.exports = { higherLowerSockets, initialHigherLowerRoomEvent, higherLowerRoomEvents };