const router = require('express').Router();
const { getUserBalance } = require('../services/api');

router.get('/balance', async (req, res) => {
    let balance = await getUserBalance(req.user.discordId);
    res.send(balance.balances);
});

module.exports = router;