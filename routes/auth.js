const router = require('express').Router();
const passport = require('passport');

router.get('/discord', passport.authenticate('discord'));
router.get('/discord/redirect', passport.authenticate('discord'), (req, res) => {
    res.redirect(process.env.FRONT_URL);
});

router.get('/', (req, res) => {
    if (req.user) {
        res.send(req.user);
    } else {
        res.status(401).send({ msg: 'Unauthorized' });
    }
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.clearCookie('SausainiukasGuminiukas');
    req.session.destroy(function (err) {
        res.redirect(process.env.LOGIN_URL);
    });
})

module.exports = router;