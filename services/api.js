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

async function sendClientBet(userId, amount, coefficient, game) {
    try {
        const betBody = { userId: userId, amount: amount, coefficient: coefficient, game: game };
        const betResponse = await fetch("https://dzimyneutron.herokuapp.com/v2/betting/static-coefficient", {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(betBody)
        });
        const bet = await betResponse.json();
        return bet.resourceId;
    } catch {
        console.log('error setting bet');
    }
}

async function sendClientBetWitouthCoefficient(userId, amount, game) {
    const betBody = { userId: userId, amount: amount, game: game };
    const betResponse = await fetch("https://dzimyneutron.herokuapp.com/v2/betting/dynamic-coefficient", {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(betBody)
    });
    const bet = await betResponse.json();
    return bet.resourceId;
}

async function sendClientBetOutcome(betId, outcome, coefficient) {
    let setBody;
    if (coefficient) {
        setBody = { won: outcome, coefficient: coefficient };
    } else {
        setBody = { won: outcome };
    }
    let response = await fetch('https://dzimyneutron.herokuapp.com/v2/betting/bets/' + betId, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(setBody)
    });
}

module.exports = { getUserNameFromGuild, getApiToken, getUserBalance, sendClientBet, sendClientBetOutcome, sendClientBetWitouthCoefficient }
