let hashPassword = require('../modules/password').hashPassword
,   utils = require('../modules/http-utils')
,   session = require('../modules/session');

const adminErrorMsg = 'admin priveleges required'
,     authFailedMsg = 'auth failed'
,     missingFieldsMsg = 'missing or mistyped fields';

module.exports = models => ({

  // POST to create a new user.
  newUser : (req, res) => {
    isAdmin(models.user, session.getUserId(req), (err, admin) => {
      if (!admin && req.body.admin) delete req.body.admin; // disallow non-admins creating admins
      saveUser(models.user, req.body, res);
    });
  },

  // POST to log in.
  login : (req, res) => {
    models.user.findOne({
      username: req.body.username,
      pwHash: hashPassword(req.body.password)
    }).exec((err, user) => {
      if (err) return utils.internalServerError(res);
      if (!user) return utils.notAuthorized(res, authFailedMsg);

      session.login(req, user.username, user._id);
      utils.ok(res, {
        admin: user.admin,
        loggedIn: session.isLoggedIn(req),
        username: session.getUsername(req)
      });
    });
  },

  // POST to log out.
  logout : (req, res) => {
    if (!session.isLoggedIn(req)) return utils.noContent(res);
    session.logout(req);
    utils.noContent(res);
  },

  // GET user details if user is logged in.
  userDetails : (req, res) => {
    isAdmin(models.user, session.getUserId(req), (err, admin) => {
      utils.ok(res, {
        admin,
        loggedIn: session.isLoggedIn(req),
        username: session.getUsername(req)
      });
    });
  },

  // GET all users.
  getAllUsers : (req, res) => {
    if (!session.isLoggedIn(req)) return utils.notAuthorized(res, adminErrorMsg);
    isAdmin(models.user, session.getUserId(req), (err, admin) => {
      if (err) return utils.internalServerError(err);
      if (!admin) return utils.notAuthorized(res, adminErrorMsg);

      models.user.find({}, '-__v').exec((err, users) => {
        if (err) return utils.internalServerError(res);
        utils.ok(res, users);
      });
    });
  },

  // GET an individual user.
  getUser : (req, res) => {
    if (!session.isLoggedIn(req)) return utils.notAuthorized(res, adminErrorMsg);
    isAdmin(models.user, session.getUserId(req), (err, admin) => {
      if (err) return utils.internalServerError(res);
      if (!admin) return utils.notAuthorized(res, adminErrorMsg);

      models.user.findById(req.params.id, '-__v').exec((err, user) => {
        if (err) return utils.internalServerError(res);
        if (!user) return utils.notFound(res);
        utils.ok(res, user);
      });
    });
  },

  // DELETE user.
  deleteUser : (req, res) => {
    if (!session.isLoggedIn(req)) return utils.notAuthorized(res, adminErrorMsg);

    isAdmin(models.user, session.getUserId(req), (err, admin) => {
      if (err) return utils.internalServerError(res);
      if (!admin) return utils.notAuthorized(res, adminErrorMsg);

      models.user.findByIdAndRemove(req.params.id).exec((err, user) => {
        if (err) return utils.internalServerError(res);
        if (!user) return utils.notFound(res);
        utils.noContent(res);
      });
    });
  },

  // PATCH to edit user.
  editUser : (req, res) => {
    if (!session.isLoggedIn(req)) return utils.notAuthorized(res, adminErrorMsg);

    isAdmin(models.user, session.getUserId(req), (err, admin) => {
      if (err) return utils.internalServerError(res);
      if (!admin) return utils.notAuthorized(res, adminErrorMsg);

      updateUser(models.user, req.params.id, req.body, (err, updated) => {
        if (err) return utils.internalServerError(res);
        utils.ok(res, updated);
      });
    });
  }

});

// PRIVATE UTILITY FUNCTIONS
// TODO: modularize

function saveUser (UserModel, user, res) {
  if (typeof user.username !== 'string' || typeof user.password !== 'string') {
    return utils.badRequest(res, missingFieldsMsg);
  }

  new UserModel(hashUserPassword(user)).save((err, newUser) => {
    if (err) return utils.internalServerError(res);
    let user = newUser.toObject();
    delete user.pwHash;
    delete user.__v;
    utils.created(res, user);
  });
}

function updateUser (UserModel, id, update, callback) {
  UserModel.findByIdAndUpdate(id, sanitize(update, hashUserPassword, 'password', 'bio', 'username', 'admin'))
           .exec(callback);
}

function sanitize (obj, customLogic, ...allowList) {
  for (let key in obj) {
    if (!allowList.find(allowed => allowed === key)) delete obj[key];
  }
  return customLogic(obj);
}

// is the user with the supplied id an admin?
function isAdmin (UserModel, id, callback) {
  UserModel.findById(id).exec((err, user) => {
    callback(err || !user || null, (err || !user) ? false : user.admin);
  });
}

function hashUserPassword (user) {
  if (user.password) {
    user.pwHash = hashPassword(user.password);
    delete user.password
  }
  return user;
}
