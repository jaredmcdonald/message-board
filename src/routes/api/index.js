module.exports = controllers => ({
  comment : require('./comment')(controllers.comment),
  user : require('./user')(controllers.user)
});
