const BetObject = require('../objects/betObject');
const { getUserBalance } = require('../services/api');
const { clientWalletToZeton } = require('../services/calculateClientWallet');
const { sendClientBet, sendClientBetOutcome, sendClientBetWitouthCoefficient } = require('../services/api');
const User = require('../database/schemas/User');

function setClientBetOutcomeMessage(bet, betStatus) {
    let newMessage = bet.clientNick + ' ';
    newMessage += (betStatus ? 'laimėjo' : 'pralaimėjo') + ' ';
    newMessage += (betStatus ? Math.floor(bet.betAmount * bet.betCoefficient) : bet.betAmount);
    return { clientId: bet.clientId, avatar: bet.clientAvatar, message: newMessage };
}

async function sendClientBetOutome(bet, betStatus) {
    await sendClientBetOutcome(bet.betId, betStatus);
}

async function sendClientBetOutomeWithCoefficient(bet, betStatus, coefficient) {
    await sendClientBetOutcome(bet.betId, betStatus, coefficient);
}

async function setBet(socketId, clientBet, coefficient, gameName) {
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
        const newBet = new BetObject(socketId, clientBet.clientId, clientBet.clientNick, Math.abs(clientBet.betAmount), clientBet.prediction, coefficient, betId, user.avatar);
        return newBet;
    }
}

function setBetToMessage(clientBet, messageList) {
    let newMessage = clientBet.clientNick + ' ' + 'pastatė ' + Math.abs(clientBet.betAmount);
    messageList.push({ clientId: clientBet.clientId, avatar: clientBet.clientAvatar, message: newMessage });
    return messageList;
}

function cleanUpList(maxAmount, list) {
    let newList = list;
    if (newList.length > maxAmount) {
        newList.shift();
    }
    return newList;
}

module.exports = { setClientBetOutcomeMessage, setBet, setBetToMessage, sendClientBetOutome, sendClientBetOutomeWithCoefficient, cleanUpList };