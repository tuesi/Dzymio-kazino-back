const { setBet, setBetToMessage, setClientBetOutcomeAndGetMessage } = require('../services/sharedFunctionService');

var io;
lineRoom = 'line';
lineNumber = 0;

var ableToBet = true;

lineClientMessages = [];
lineBets = [];
previousLineResults = [];

itemProbability = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5];

coeficients = [0, 1, 1.5, 2, 4, 10];

function lineSockets(lineIo) {
    io = lineIo;
    timeBetweenSpins();
}

function lineRoomEvents(socket, eventObject) {
    switch (eventObject.event) {
        case 'getPreviousResults':
            socket.emit('previousResults', previousLineResults);
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

function calculateNumber() {
    let itemList = [];
    for (var i = 0; i < 50; i++) {
        if (i == 41) {
            let number = itemProbability[(Math.floor(Math.random() * 44))];
            lineNumber = coeficients[number];
            previousLineResults.push(lineNumber);
            itemList.push(number);
        }
        itemList.push(itemProbability[(Math.floor(Math.random() * 44))]);
    }
    console.log(itemList[41]);
    io.to(lineRoom).emit('lineSet', itemList);
    setTimeout(() => {
        spin();
    }, 50);
}

function spin() {
    let move = 0;
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
    timeBetweenSpins();
    sendBetResultToClient();
    getClientStatusToMessage();
    sendPreviousLineResults();
}

function timeBetweenSpins() {
    let spinTimer = timeTillnextSpin;
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
    io.to(lineRoom).emit('previousResults', previousLineResults);
}

async function setLineBet(socket, clientBet) {
    let newBet = await setBet(socket.id, clientBet, null, 'multyplier');
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

async function getClientStatusToMessage() {
    lineBets.forEach(async bet => {
        bet.betCoefficient = lineNumber;
        let betMessage = setClientBetOutcomeAndGetMessage(bet, lineNumber == 0 ? false : true);
        lineClientMessages.push(betMessage);
    });
    io.in(lineRoom).emit('clientBetHistory', lineClientMessages);
}

module.exports = { lineSockets, lineRoomEvents };