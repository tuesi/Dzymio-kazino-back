class BetObject {
    constructor(socketId, clientId, betAmount, prediction) {
        this.socketId = socketId;
        this.clientId = clientId;
        this.betAmount = betAmount;
        this.prediction = prediction;
    }
}
module.exports = BetObject;