const BetResultService = require('../services/betResultService');
const { setBet, setBetToMessage, setClientBetOutcomeMessage, sendClientBetOutome, cleanUpList, checkClientLives, cancelBet, setClientBetMutualOutcomeMessage, checkAndRemoveClientLives } = require('../services/sharedFunctionService');
const BetResponseObject = require('../objects/betResponseObject');

var sliceSize = 360 / 20;
var count = 0;
var rotation = 0;
var endSpin = false;
var timeTillnextSpin = process.env.TIMER_IN_SECONDS;
var spinValue = 0;
var previousWheelResults = [];
var wheelBets = [];
var wheelClientMessages = [];
var ableToBetWheel = true;
var spinTimer = 0;

var currentDaySpin = 1;
var currentDate = new Date();

var wheelValues = ['W', '1', '8', '15', '4', '11', '18', '7', '14', '3', 'X', '10', '17', '6', '13', '2', '9', '16', '5', '12'];
var wheelColors = ['violetinis', 'žalias', 'mėlynas', 'raudonas', 'žalias', 'mėlynas', 'raudonas', 'žalias', 'mėlynas', 'raudonas', 'geltonas', 'žalias', 'mėlynas', 'raudonas', 'žalias', 'mėlynas', 'raudonas', 'žalias', 'mėlynas', 'raudonas'];

var io;
var wheelRoom = 'wheel';

function wheelSockets(wheelIo) {
    io = wheelIo;
    currentDate = new Date().toLocaleDateString("lt");
    timeBetweenSpins();
}

function initialWheelRoomEvent(socket) {
    socket.emit('initialWheelPos', count);
    socket.emit('timeTillSpin', spinTimer);
    socket.emit('initialButtonState', ableToBetWheel);
    socket.emit('clientBetHistory', wheelClientMessages);
}

function checkIfThereIsPeopleInRoom() {
    if (io.sockets.adapter.rooms.get(wheelRoom)) {
        return true;
    } else {
        return false;
    }
}

function wheelRoomEvents(socket, eventObject) {
    switch (eventObject.event) {
        case 'getPreviousResults':
            socket.emit('previousWheelResults', previousWheelResults);
            break;
        case 'bet':
            if (ableToBetWheel) {
                setWheelBet(socket, eventObject.data);
            } else {
                socket.emit('betError', true);
            }
            break;
    }
}

function setSpin() {

    let spinIndex = Math.floor(Math.random() * 20);

    spinValue = spinIndex;

    endSpin = false;
    const rotMin = (sliceSize * (spinIndex)) - (sliceSize / 5);
    const rotMax = (sliceSize * (spinIndex)) + (sliceSize / 5);

    const fullRots = Math.floor(Math.random() * 5) + 5; // minimum 5 rotations max 9

    count = 0;

    const rot = (fullRots * 360) + Math.floor(Math.random() * (rotMax - rotMin + 1) + rotMin);
    rotation = rot;

    spin();
}

function timeBetweenSpins() {
    spinTimer = timeTillnextSpin;
    let spinTime = setInterval(function () {
        if (checkIfThereIsPeopleInRoom()) io.in(wheelRoom).emit('timeTillSpin', spinTimer);
        spinTimer--;

        if (spinTimer < 5) {
            ableToBetWheel = false;
            if (checkIfThereIsPeopleInRoom()) io.in(wheelRoom).emit('betTimeEnd', true);
        }

        if (spinTimer < 0) {
            clearInterval(spinTime);
            if (checkIfThereIsPeopleInRoom()) io.in(wheelRoom).emit('resetWheel', true);
            setTimeout(function () {
                if (checkIfThereIsPeopleInRoom()) io.in(wheelRoom).emit('initialWheelPos', 0);
            }, 60);
            setTimeout(function () {
                if (checkIfThereIsPeopleInRoom()) io.in(wheelRoom).emit('startSpin', true);
            }, 120);
            setTimeout(function () {
                setSpin();
            }, 180);
        }
    }, 1000);
}

function spin() {
    let WheelSpin = setInterval(function () {
        if (checkIfThereIsPeopleInRoom()) io.in(wheelRoom).emit('wheelPos', count);
        if (endSpin) {
            clearInterval(WheelSpin);
        }
    }, 0);

    let SpinCount = setInterval(function () {
        if (count <= rotation) {
            if (count + 200 < rotation) {
                count += 5;
            } else {
                count += 1;
            }
        } else {
            clearInterval(SpinCount);
            endSpin = true;
            setTimeout(() => {
                resetRoom();
            }, 5000);
        }
    }, 10);
}

function resetRoom() {
    sendPreviousWeelResults();
    sendBetResultToClient();
    getClientStatusToMessage();
    ableToBetWheel = true;
    if (checkIfThereIsPeopleInRoom()) io.in(wheelRoom).emit('newRound', true);
    timeBetweenSpins();
}

async function currentDaySpinAmount() {
    if (currentDate < new Date().toLocaleDateString("lt")) {
        currentDaySpin = 1;
        currentDate = new Date().toLocaleDateString("lt");
    } else {
        currentDaySpin++;
    }
    let currentSpinMessage = { clientId: null, avatar: null, message: currentDaySpin.toString() + " sukimas" };
    wheelClientMessages.push(currentSpinMessage);
    wheelClientMessages = cleanUpList(100, wheelClientMessages);
    if (checkIfThereIsPeopleInRoom()) io.in(wheelRoom).emit('clientBetHistory', wheelClientMessages);
    if (checkIfThereIsPeopleInRoom()) io.in(wheelRoom).emit('currentSpinNo', currentDaySpin);
}

function sendPreviousWeelResults() {
    previousWheelResults.push(wheelValues[spinValue]);
    previousWheelResults = cleanUpList(20, previousWheelResults);
    if (checkIfThereIsPeopleInRoom()) io.in(wheelRoom).emit('previousWheelResults', previousWheelResults);
}

function sendBetResultToClient() {
    wheelBets.forEach(async bet => {
        const response = new BetResponseObject();
        const betResult = BetResultService.getWheelBetStatus(bet.prediction, spinValue, wheelValues, wheelColors);
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

function getClientStatusToMessage() {
    var count = 0;
    wheelBets.forEach(async (bet, index, array) => {
        const betResult = BetResultService.getWheelBetStatus(bet.prediction, spinValue, wheelValues, wheelColors);
        if (betResult == 0 && await checkAndRemoveClientLives(bet.clientId)) {
            const betOutcome = await cancelBet(bet, io);
            bet.betAmount = betOutcome;
            const betMessage = await setClientBetMutualOutcomeMessage(bet);
            wheelClientMessages.push(betMessage);
            wheelClientMessages = cleanUpList(100, wheelClientMessages);
        } else {
            sendClientBetOutome(bet, betResult == 0 ? false : true, io);
            let betMessage = setClientBetOutcomeMessage(bet, betResult == 0 ? false : true);
            wheelClientMessages.push(betMessage);
            wheelClientMessages = cleanUpList(100, wheelClientMessages);
        }
        count++;
        if (count === array.length) {
            await currentDaySpinAmount();
        }
    });
    if (!(wheelBets.length > 0)) {
        currentDaySpinAmount();
    }
    wheelBets = [];
}

async function setWheelBet(socket, clientBet) {
    if (!wheelBets.some(bet => bet.clientId === clientBet.clientId)) {
        let newBet = await setBet(socket.id, clientBet, BetResultService.getWheelBetCoefficients(clientBet.prediction), 'WHEEL', io);
        wheelBets.push(newBet);
        wheelClientMessages = setBetToMessage(newBet, wheelClientMessages, BetResultService.wheelBetToNiceName(clientBet.prediction));
        wheelClientMessages = cleanUpList(100, wheelClientMessages);
        if (checkIfThereIsPeopleInRoom()) io.in(wheelRoom).emit('clientBetHistory', wheelClientMessages);
    }
}

module.exports = { wheelSockets, initialWheelRoomEvent, wheelRoomEvents };