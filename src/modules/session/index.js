/*
 *  session management utils
 *
 */

exports.isLoggedIn = (req) => !!req.session && !!req.session.username && !!req.session.userId;

exports.getUsername = (req) => req.session.username || '';

exports.getUserId = (req) => req.session.userId || '';

exports.login = function (req, username, userId) {
  req.session.username = username;
  req.session.userId = userId;
}

exports.logout = (req) => req.session.destroy();
