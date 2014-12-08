/*
 *  session management utils
 *
 */

exports.isLoggedIn = function (req) {
  return !!req.session && !!req.session.username && !!req.session.userId;
}

exports.getUsername = function (req) {
  return req.session.username || '';
}

exports.getUserId = function (req) {
  return req.session.userId || '';
}

exports.login = function (req, username, userId) {
  req.session.username = username;
  req.session.userId = userId;
}

exports.logout = function (req) {
  req.session.destroy();
}
