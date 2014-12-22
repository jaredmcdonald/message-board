let router = require('express').Router();

router.get('/', (req, res) => res.render('index', { title : 'express-board' }));

module.exports = router;
