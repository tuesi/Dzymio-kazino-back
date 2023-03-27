const router = require('express').Router();
const passport = require('passport');
const { getIsUserLotoMember } = require('../services/api');

router.get('/discord', passport.authenticate('discord'));
router.get('/discord/redirect', passport.authenticate('discord', { failureRedirect: process.env.ERROR_URL }), (req, res) => {
    res.redirect(process.env.FRONT_URL);
});

router.get('/', (req, res) => {
    if (req.user) {
        res.send(req.user);
    } else {
        res.status(401).send({ msg: 'Unauthorized' });
    }
});

router.get('/member', async (req, res) => {
    if (req.user) {
        const isMember = await getIsUserLotoMember(req.user.discordId)
        if (isMember) {
            res.status(201).send(true);
        } else {
            res.status(201).send(false);
        }
    } else {
        res.status(201).send(false);
    }
})

router.get('/logout', (req, res) => {
    req.logOut(function (err) {
        res.clearCookie('SausainiukasGuminiukas');
        res.redirect(process.env.LOGIN_URL);
    });
})

module.exports = router;