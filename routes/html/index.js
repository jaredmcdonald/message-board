var express = require('express');
var router = express.Router();
var session = require('../../modules/session');

router.get('/', function (req, res) {
  res.render('index', {
    loggedIn: session.isLoggedIn(req),
    username: session.getUsername(req)
  });
});

module.exports = router;
