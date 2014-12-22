let router = require('express').Router();

router.get('/', function (req, res) {
  res.render('index', { title : 'express-board' });
});

module.exports = router;
