const router = require('express').Router();
const auth = require('./auth');
const discord = require('./discord');
const jimmy = require('./jimmy');
const lives = require('./lives');
const leaderboard = require('./leaderboard');

router.use('/auth', auth);
router.use('/discord', discord);
router.use('/jimmy', jimmy);
router.use('/lives', lives);
router.use('/leaderboard', leaderboard);
module.exports = router;