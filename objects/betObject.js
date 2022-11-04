class BetObject {
    constructor(socketId, clientId, clientNick, betAmount, prediction, betId) {
        this.socketId = socketId;
        this.clientId = clientId;
        this.clientNick = clientNick;
        this.betAmount = betAmount;
        this.prediction = prediction;
        this.betId = betId;
    }
}
module.exports = BetObject;