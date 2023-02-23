
const { resetAbleToGetLives } = require('./api');
const cron = require('node-cron');

module.exports = () => {

    var job = cron.schedule('00 22 * * *', async function () {
        await resetAbleToGetLives();
    }, null, true, 'Europe/Vilnius');

    job.start();
}