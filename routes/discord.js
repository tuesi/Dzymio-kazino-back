const router = require('express').Router();

router.get('/', (req, res) => {
    res.cookie(200);
});

module.exports = router;