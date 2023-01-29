const fetch = require('node-fetch');
const loginData = { username: process.env.API_USERNAME, password: process.env.API_PASSWORD };
const Leaderboard = require('../database/schemas/Leaderboard');
const BetHistoryObject = require('../objects/betHistoryObject');

var token;

async function getApiToken() {
    const tokenResponse = await fetch("https://dzimyneutron.herokuapp.com/v1/auth/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    });
    if (tokenResponse.status == 200) {
        const token = await tokenResponse.json();
        this.token = token.token;
    }
}

async function getBetHistory() {
    let betHistory = [];
    const response = await fetch('https://dzimyneutron.herokuapp.com/v2/betting/bets', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        }
    });
    if (response.status === 403) {
        await getApiToken();
        getBetHistory();
    } else {
        const data = await response.json();
        let count = 0;
        data.forEach(async (bet, index, array) => {
            if (bet.done == true && bet.cancelled == false && bet.coefficient !== 1) {
                const foundIndex = betHistory.findIndex(x => BigInt(x.userId) == BigInt(bet.userIdString));
                if (foundIndex !== -1) {
                    if (bet.won == true) {
                        betHistory[foundIndex].won = (parseInt(betHistory[foundIndex].won) + parseInt(bet.payout));
                    } else {
                        betHistory[foundIndex].lost = (parseInt(betHistory[foundIndex].lost) + parseInt(bet.amount));
                    }
                } else {
                    if (bet.won == true) {
                        betHistory.push(new BetHistoryObject('', BigInt(bet.userIdString), bet.payout, 0));
                    } else {
                        betHistory.push(new BetHistoryObject('', BigInt(bet.userIdString), 0, bet.amount));
                    }
                }
            }
            count++;
            if (count == array.length) {
                betHistory.forEach(async bet => {
                    await Leaderboard.findOneAndUpdate({ discordId: bet.userId }, {
                        won: bet.won,
                        lost: bet.lost
                    });
                });
            }
        });
    }
}

module.exports = { getBetHistory }