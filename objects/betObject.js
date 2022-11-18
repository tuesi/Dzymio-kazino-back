class BetObject {
    constructor(socketId, clientId, clientNick, betAmount, prediction, betCoefficient, betId, avatar) {
        this.socketId = socketId;
        this.clientId = clientId;
        this.clientNick = clientNick;
        this.betAmount = betAmount;
        this.prediction = prediction;
        this.betCoefficient = betCoefficient;
        this.betId = betId;
        this.clientAvatar = avatar;
    }
}
module.exports = BetObject;