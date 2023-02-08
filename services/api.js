const fetch = require('node-fetch');
const loginData = { username: process.env.API_USERNAME, password: process.env.API_PASSWORD };
const Lives = require('../database/schemas/Lives');
const Leaderboard = require('../database/schemas/Leaderboard');

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
    if (guildInfo.status == 200) {
        return guildInfo.json();
    }
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
    } else if (walletResponse.status == 403) {
        await getApiToken();
        await getUserBalance();
    }
    else {
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
        if (betResponse.status === 200) {
            const bet = await betResponse.json();
            return bet.resourceId;
        } else if (betResponse.status === 403) {
            await getApiToken();
            await sendClientBet(userId, amount, coefficient, game);
        } else {
            console.log(betResponse);
        }

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
    if (betResponse.status === 200) {
        const bet = await betResponse.json();
        return bet.resourceId;
    } else if (betResponse.status === 403) {
        await getApiToken();
        await sendClientBetWitouthCoefficient(userId, amount, game);
    } else {
        console.log(betResponse);
    }

}

async function sendClientBetOutcome(betId, outcome, coefficient, announce) {
    let setBody;
    if (coefficient) {
        if (announce !== undefined || announce !== null) {
            setBody = { won: outcome, coefficient: coefficient, announce: announce };
        } else {
            setBody = { won: outcome, coefficient: coefficient };
        }
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
    if (response.status === 403) {
        await getApiToken();
        sendClientBetOutcome(betId, outcome, coefficient);
    }
}

async function cancelBetOutcome(betId) {
    let response = await fetch('https://dzimyneutron.herokuapp.com/v2/betting/bets/' + betId + '/cancel', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        }
    });
    if (response.status === 403) {
        await getApiToken();
        cancelBetOutcome(betId);
    }
}

async function addClientLives(userId) {
    if (await Lives.findOne({ discordId: userId })) {
        await Lives.updateOne(
            { discordId: userId },
            {
                $inc: { lives: 1 },
                givenToday: true
            },
        );
    } else {
        await Lives.create({
            discordId: userId,
            lives: 1,
            givenToday: true
        });
    }
}

async function wasGivenToday(userId) {
    if (await Lives.findOne({ discordId: userId })) {
        await Lives.updateOne(
            { discordId: userId },
            {
                givenToday: true
            },
        );
    } else {
        await Lives.create({
            discordId: userId,
            lives: 0,
            givenToday: true
        });
    }
}

async function removeClientLives(userId) {
    if (await Lives.findOne({ discordId: userId })) {
        await Lives.updateOne(
            { discordId: userId },
            { $inc: { lives: -1 } }
        );
    }
}

async function getClientLives(userId) {
    return await Lives.findOne({ discordId: userId });
}

async function resetAbleToGetLives() {
    await Lives.updateMany({}, { givenToday: false })
}

async function updateLeaderboard(clientId, clientName, betStatus, amount) {
    if (betStatus) {
        const findUser = await Leaderboard.findOneAndUpdate({ discordId: clientId }, {
            username: clientName,
            $inc: { won: amount }
        }, { new: true });
        if (!findUser) {
            await Leaderboard.create({
                discordId: clientId,
                username: clientName,
                won: amount,
                lost: 0
            });
        }
    } else {
        const findUser = await Leaderboard.findOneAndUpdate({ discordId: clientId }, {
            username: clientName,
            $inc: { lost: amount }
        }, { new: true });
        if (!findUser) {
            await Leaderboard.create({
                discordId: clientId,
                username: clientName,
                won: 0,
                lost: amount
            });
        }
    }
}

async function getLeaderboard() {
    return await Leaderboard.find();
}

module.exports = {
    getUserNameFromGuild, getApiToken, getUserBalance, sendClientBet, sendClientBetOutcome,
    sendClientBetWitouthCoefficient, addClientLives, removeClientLives, getClientLives, resetAbleToGetLives,
    updateLeaderboard, getLeaderboard, cancelBetOutcome, wasGivenToday
}
