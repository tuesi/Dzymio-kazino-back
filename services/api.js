const fetch = require('node-fetch');
const loginData = { username: process.env.API_USERNAME, password: process.env.API_PASSWORD };

var token;

async function getUserNameFromGuild(accessToken) {
    if (!this.token) {
        await getApiToken();
    }
    const guildInfo = await fetch("https://discord.com/api/users/@me/guilds/689147676507635800/member", {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return guildInfo.json();
}

async function getApiToken() {
    const tokenResponse = await fetch("https://dzimyneutron.herokuapp.com/v1/auth/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    });
    console.log(tokenResponse.status);
    if (tokenResponse.status == 200) {
        const token = await tokenResponse.json();
        this.token = token.token;
    }
}

async function getUserBalance(userId) {
    if (!this.token) {
        await getApiToken();
    }
    const walletResponse = await fetch("https://dzimyneutron.herokuapp.com/v1/wallet/" + userId, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${this.token}`
        }
    });
    if (walletResponse.status == 200) {
        const wallet = walletResponse.json();
        return wallet;
    } else {
        console.log(walletResponse);
    }
}

async function sendClientBet(userId, amount, coefficient) {
    console.log(userId);
    console.log(amount);
    console.log(coefficient);
    const betBody = { userId: userId, amount: amount, coefficient: coefficient };
    const betResponse = await fetch("https://dzimyneutron.herokuapp.com/v1/bets", {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(betBody)
    });
    const betId = await betResponse.json();

    return betId.betId;
}

async function sendClientBetOutcome(betId, outcome) {
    await fetch('https://dzimyneutron.herokuapp.com/v1/bets/' + betId + '/outcome' + outcome, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${this.token}`
        }
    });
}

module.exports = { getUserNameFromGuild, getApiToken, getUserBalance, sendClientBet, sendClientBetOutcome }
