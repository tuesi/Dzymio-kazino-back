const router = require('express').Router();
const { getUserBalance } = require('../services/api');

router.get('/balance', (req, res) => {
    res.send(getUserBalance(req.user.discordId));
});

module.exports = router;