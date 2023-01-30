const router = require('express').Router();
const bodyParser = require('body-parser')
const { addClientLives, removeClientLives, getClientLives, wasGivenToday } = require('../services/api');

router.post('/addLives', bodyParser.json(), async (req, res) => {
    if (req.body.discordId && req.body.secret == process.env.secret) {
        let user = await getClientLives(req.body.discordId);
        if (user.givenToday == false) {
            await addClientLives(req.body.discordId);
            res.sendStatus(201);
        } else {
            res.sendStatus(403);
        }
    }
});

router.post('/setGiven', bodyParser.json(), async (req, res) => {
    if (req.body.discordId && req.body.secret == process.env.secret) {
        await wasGivenToday(req.body.discordId);
        res.sendStatus(201);
    } else {
        res.sendStatus(403);
    }
});

router.post('/removeLives', bodyParser.json(), async (req, res) => {
    if (req.body.discordId && req.body.secret == process.env.secret) {
        await removeClientLives(req.body.discordId);
        res.sendStatus(201);
    } else {
        res.sendStatus(403);
    }
});

router.get('/getLives', async (req, res) => {
    if (req.user && req.user.discordId) {
        let lives = await getClientLives(req.user.discordId);
        if (lives) {
            var string = JSON.stringify(lives);
            var obj = JSON.parse(string);
            res.send({ lives: obj.lives });
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(403);
    }
});

router.get('/wasGiven', async (req, res) => {
    if (req.query.discordId) {
        let lives = await getClientLives(req.query.discordId);
        if (lives) {
            var string = JSON.stringify(lives);
            var obj = JSON.parse(string);
            res.send({ isSet: obj.givenToday });
        } else {
            res.sendStatus(204);
        }
    } else {
        res.sendStatus(403);
    }
});

module.exports = router;