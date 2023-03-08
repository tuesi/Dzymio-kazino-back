const BetObject = require('../objects/betObject');
const { getUserBalance } = require('../services/api');
const { clientWalletToZeton } = require('../services/calculateClientWallet');
const { sendClientBet, sendClientBetOutcome, sendClientBetWitouthCoefficient, getClientLives, removeClientLives, updateLeaderboard, cancelBetOutcome } = require('../services/api');
const User = require('../database/schemas/User');

function setClientBetOutcomeMessage(bet, betStatus) {
    let newMessage = "";
    newMessage += (betStatus ? ' laimėjo' : ' pralaimėjo') + ' ';
    newMessage += (betStatus ? Math.floor(bet.betAmount * bet.betCoefficient) : bet.betAmount);
    return { clientId: bet.clientId, avatar: bet.clientAvatar, username: bet.clientNick, message: newMessage };
}

async function setClientBetMutualOutcomeMessage(bet) {
    let newMessage = "";
    newMessage += 'Susigražino' + ' ';
    newMessage += bet.betAmount;
    return { clientId: bet.clientId, avatar: bet.clientAvatar, username: bet.clientNick, message: newMessage };
}

async function sendClientBetOutome(bet, betStatus, io) {
    await updateLeaderboard(bet.clientId, bet.clientNick, betStatus, (betStatus ? Math.floor(bet.betAmount * bet.betCoefficient) : bet.betAmount));
    await sendClientBetOutcome(bet.betId, betStatus);
    io.in(bet.socketId).emit('updateWallet');
}

async function sendClientBetOutomeWithCoefficient(bet, betStatus, coefficient, io, announce) {
    await updateLeaderboard(bet.clientId, bet.clientNick, betStatus, (betStatus ? Math.floor(bet.betAmount * coefficient) : bet.betAmount));
    await sendClientBetOutcome(bet.betId, betStatus, coefficient, announce);
    io.in(bet.socketId).emit('updateWallet');
}

async function cancelBet(bet, io) {
    const cancelResponse = await cancelBetOutcome(bet.betId);
    io.in(bet.socketId).emit('updateWallet');
    return cancelResponse.payout;
}

async function setBet(socketId, clientBet, coefficient, gameName, io) {
    //check if user has required amount to bet
    const userBalance = await getUserBalance(clientBet.clientId);
    const balances = await userBalance.balances;
    const user = await User.findOne({ discordId: clientBet.clientId });
    const userBalanceInZeton = clientWalletToZeton(balances.GOLD, balances.SILVER, balances.COPPER);
    if (clientBet.betAmount && userBalanceInZeton >= clientBet.betAmount) {
        let betId;
        if (coefficient == null) {
            betId = await sendClientBetWitouthCoefficient(clientBet.clientId, Math.abs(clientBet.betAmount), gameName);
        } else if (clientBet.prediction) {
            betId = await sendClientBet(clientBet.clientId, Math.abs(clientBet.betAmount), coefficient, gameName);
        }
        io.in(socketId).emit('updateWallet');
        const newBet = new BetObject(socketId, clientBet.clientId, clientBet.clientNick, Math.abs(clientBet.betAmount), clientBet.prediction, coefficient, betId, user.avatar);
        return newBet;
    }
}

function setBetToMessage(clientBet, messageList, prediction) {
    let newMessage = "";
    if (prediction) {
        newMessage = ' pastatė ' + Math.abs(clientBet.betAmount) + " spėjimui " + prediction;
    } else {
        newMessage = ' pastatė ' + Math.abs(clientBet.betAmount);
    }
    messageList.push({ clientId: clientBet.clientId, avatar: clientBet.clientAvatar, username: clientBet.clientNick, message: newMessage });
    return messageList;
}

function cleanUpList(maxAmount, list) {
    let newList = list;
    if (newList.length > maxAmount) {
        newList.shift();
    }
    return newList;
}

async function checkAndRemoveClientLives(clientId) {
    const clientLives = await getClientLives(clientId);
    if (clientLives) {
        var string = JSON.stringify(clientLives);
        var obj = JSON.parse(string);
        if (obj.lives > 0) {
            await removeClientLives(clientId);
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

async function checkClientLives(clientId) {
    const clientLives = await getClientLives(clientId);
    if (clientLives) {
        var string = JSON.stringify(clientLives);
        var obj = JSON.parse(string);
        if (obj.lives > 0) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

module.exports = { setClientBetOutcomeMessage, setBet, setBetToMessage, sendClientBetOutome, sendClientBetOutomeWithCoefficient, cleanUpList, checkClientLives, cancelBet, setClientBetMutualOutcomeMessage, checkAndRemoveClientLives };