const router = require('express').Router();
const { getUserBalance } = require('../services/api');

router.get('/balance', async (req, res) => {
    if (req.user) {
        let balance = await getUserBalance(req.user.discordId);
        if (balance) {
            res.send(balance.balances);
        } else {
            res.sendStatus(401);
        }
    }
});

module.exports = router;