const { setBet, setBetToMessage, setClientBetOutcomeMessage, sendClientBetOutome, cleanUpList } = require('../services/sharedFunctionService');
const BetResponseObject = require('../objects/betResponseObject');

var io;
coinRoom = 'coin';

coinRotation = 1.55;
coinPositionZ = 1;
coinSide = 1;
rotationNumber = 15.6;
previousCoins = [];
coinBets = [];
coinClientMessages = [];
var ableToBet = true;
var spinTimer = 0;

var currentDaySpin = 1;
var currentDate = new Date();

function coinSockets(coinIo) {
    io = coinIo;
    currentDate = new Date().toLocaleDateString("lt");
    timeBetweenSpins();
}

function initialCoinRoomEvent(socket) {
    socket.emit('timeTillSpin', spinTimer);
    socket.emit('initialButtonState', ableToBet);
    socket.emit('clientBetHistory', coinClientMessages);
    socket.emit('initialCoinPos', { rotation: coinRotation, positionZ: coinPositionZ });
}

function coinRoomEvents(socket, eventObject) {
    switch (eventObject.event) {
        case 'getPreviousResults':
            socket.emit('previousCoins', previousCoins);
            break;
        case 'bet':
            if (ableToBet) {
                setCoinBet(socket, eventObject.data);
            } else {
                socket.emit('betError', true);
            }
            break;
    }
}

function calculateSide() {
    coinSide = Math.floor(Math.random() * 2) + 1;
    setRotationNumber();
}

function sendPreviousCoins() {
    previousCoins.push(coinSide);
    previousCoins = cleanUpList(20, previousCoins);
    io.to(coinRoom).emit('previousCoins', previousCoins);
}

function setRotationNumber() {
    if (coinSide == 1) {
        rotationNumber = 17.2;
    } else {
        rotationNumber = 15.6;
    }
    spin();
}

function spin() {
    let CoinSpin = setInterval(() => {
        io.to(coinRoom).emit('coinPos', { rotation: coinRotation, positionZ: coinPositionZ });
        coinRotation += 0.1;
        if (coinPositionZ < 100 && coinRotation < rotationNumber) {
            coinPositionZ += 0.5;
        } else if (coinPositionZ > 1) {
            coinPositionZ -= 0.5;
        }

        if (coinPositionZ <= 1) {
            if (coinSide == 1) {
                io.to(coinRoom).emit('coinPos', { rotation: 1.55, positionZ: 1 });
                io.to(coinRoom).emit('endPos', { pos: 1.55 });
            } else {
                io.to(coinRoom).emit('coinPos', { rotation: 4.7, positionZ: 1 });
                io.to(coinRoom).emit('endPos', { pos: 4.7 });
            }

            clearInterval(CoinSpin);
            setTimeout(() => {
                resetRoom();
            }, 1000)
        }
    }, 5);
}

function resetRoom() {
    coinRotation = 1.55;
    coinPositionZ = 1;
    ableToBet = true;
    sendPreviousCoins();
    io.in(coinRoom).emit('newRound', true);
    sendBetResultToClient();
    getClientStatusToMessage();
    timeBetweenSpins();
    currentDaySpinAmount();
}

function currentDaySpinAmount() {
    if (currentDate < new Date().toLocaleDateString("lt")) {
        currentDaySpin = 1;
    } else {
        currentDaySpin++;
    }
    let currentSpinMessage = { clientId: null, avatar: null, message: currentDaySpin.toString() + " sukimas" };
    coinClientMessages.push(currentSpinMessage);
    coinClientMessages = cleanUpList(100, coinClientMessages);
    io.in(coinRoom).emit('clientBetHistory', coinClientMessages);
    io.in(coinRoom).emit('currentSpinNo', currentDaySpin);
}

function timeBetweenSpins() {
    spinTimer = timeTillnextSpin;
    let spinTime = setInterval(function () {
        io.to(coinRoom).emit('timeTillSpin', spinTimer);
        spinTimer--;

        if (spinTimer < 5) {
            ableToBet = false;
            io.to(coinRoom).emit('betTimeEnd', true);
        }

        if (spinTimer < 0) {
            clearInterval(spinTime);
            setTimeout(function () {
                calculateSide();
            }, 180);
        }
    }, 1000);
}

async function setCoinBet(socket, clientBet) {
    let newBet = await setBet(socket.id, clientBet, 2, 'COIN_FLIP');
    coinBets.push(newBet);
    coinClientMessages = setBetToMessage(newBet, coinClientMessages);
    coinClientMessages = cleanUpList(100, coinClientMessages);
    io.in(coinRoom).emit('clientBetHistory', coinClientMessages);
}

function sendBetResultToClient() {
    coinBets.forEach(bet => {
        const response = new BetResponseObject();
        const betResult = bet.prediction == coinSide.toString() ? 2 : 0;
        response.status = betResult == 0 ? false : true;
        response.amount = (betResult == 0 ? bet.betAmount : bet.betAmount * betResult);
        io.in(bet.socketId).emit('betStatus', response);
    });
}

function getClientStatusToMessage() {
    coinBets.forEach(bet => {
        const betResult = bet.prediction == coinSide.toString() ? 2 : 0;
        sendClientBetOutome(bet, betResult == 0 ? false : true);
        let betMessage = setClientBetOutcomeMessage(bet, betResult == 0 ? false : true);
        coinClientMessages.push(betMessage);
        coinClientMessages = cleanUpList(100, coinClientMessages);
    });
    io.in(coinRoom).emit('clientBetHistory', coinClientMessages);
    coinBets = [];
}

module.exports = { coinSockets, initialCoinRoomEvent, coinRoomEvents };