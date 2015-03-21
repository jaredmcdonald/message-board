let router = require('express').Router();

router.get('/', (req, res) => res.render('index', {
    title : process.env.APPLICATION_NAME || 'express-board'
  }));

module.exports = router;
