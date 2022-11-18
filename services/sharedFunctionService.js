const BetResponseObject = require('../objects/betResponseObject');
const BetObject = require('../objects/betObject');
const { getUserBalance } = require('../services/api');
const { clientWalletToZeton } = require('../services/calculateClientWallet');
const { sendClientBet, sendClientBetOutcome, sendClientBetWitouthCoefficient } = require('../services/api');
const User = require('../database/schemas/User');

async function setClientBetOutcomeAndGetMessage(bet, betStatus) {
    let newMessage = bet.clientNick + ' ';
    newMessage += (betStatus ? 'pralaimėjo' : 'laimėjo') + ' ';
    newMessage += (betStatus ? bet.betAmount : bet.betAmount * bet.betCoefficient);
    await sendClientBetOutcome(bet.betId, betStatus);
    return { clientId: bet.clientId, avatar: bet.clientAvatar, message: newMessage };
}

async function setBet(socketId, clientBet, coefficient, gameName) {
    //check if user has required amount to bet
    const userBalance = await getUserBalance(clientBet.clientId);
    const balances = await userBalance.balances;
    const user = await User.findOne({ discordId: clientBet.clientId });
    console.log(user);
    const userBalanceInZeton = clientWalletToZeton(balances.GOLD, balances.SILVER, balances.COPPER);
    if (clientBet.betAmount && clientBet.prediction && userBalanceInZeton >= clientBet.betAmount) {
        let betId;
        if (coefficient == null) {
            betId = await sendClientBetWitouthCoefficient(clientBet.clientId, Math.abs(clientBet.betAmount), gameName);
        } else {
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

module.exports = { setClientBetOutcomeAndGetMessage, sendBetResultToClient, setBet, setBetToMessage };