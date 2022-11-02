const router = require('express').Router();
const auth = require('./auth');
const discord = require('./discord');
const jimmy = require('./jimmy');

router.use('/auth', auth);
router.use('/discord', discord);
router.use('/jimmy', jimmy);
module.exports = router;