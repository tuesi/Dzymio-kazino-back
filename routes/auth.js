const router = require('express').Router();
const passport = require('passport');

router.get('/discord', passport.authenticate('discord'));
router.get('/discord/redirect', passport.authenticate('discord', { failureRedirect: process.env.ERROR_URL }), (req, res) => {
    res.redirect(process.env.FRONT_URL);
});

router.get('/', async (req, res) => {
    if (req.user) {
        if (process.env.WHITELIST == 'true') {
            authorized = await Whitelist.findOne({ discordId: id }) ? true : false;
            if (authorized) {
                res.send(req.user);
            } else {
                res.status(401).send({ msg: 'Unauthorized' });
            }
        } else {
            res.send(req.user);
        }
    } else {
        res.status(401).send({ msg: 'Unauthorized' });
    }
});

router.get('/logout', (req, res) => {
    req.logOut(function (err) {
        res.clearCookie('SausainiukasGuminiukas');
        res.redirect(process.env.LOGIN_URL);
    });
})

module.exports = router;