const router = require('express').Router();
const { getLeaderboard } = require('../services/api');

router.get('/getLeaderboard', async (req, res) => {
    res.send(await getLeaderboard());
});

module.exports = router;