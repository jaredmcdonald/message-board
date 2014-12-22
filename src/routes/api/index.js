module.exports = (models) => ({
  comment : require('./comment')(models),
  user : require('./user')(models)
});
