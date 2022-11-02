const fetch = require('node-fetch');
const loginData = {username: process.env.API_USERNAME, password: process.env.API_PASSWORD};

var token;

async function getUserNameFromGuild(accessToken) {
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
    if(tokenResponse.status == 200) {
        const token = await tokenResponse.json();
        console.log(token);
        this.token = token.token;
    }
}

async function getUserBalance(userId) {
    const walletResponse = await fetch("https://dzimyneutron.herokuapp.com/v1/wallet/" + userId, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if(walletResponse.status == 200) {
        const wallet = walletResponse.json();
        return wallet.balances;
    }
}

module.exports = {getUserNameFromGuild, getApiToken, getUserBalance}
