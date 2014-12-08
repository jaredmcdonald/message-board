/*
 *  session management utils
 *
 */

exports.isLoggedIn = function (req) {
  return !!req.session && !!req.session.username;
}

exports.getUsername = function (req) {
  return req.session.username || '';
}

exports.login = function (req, username) {
  req.session.username = username;
}

exports.logout = function (req) {
  req.session.destroy();
}
