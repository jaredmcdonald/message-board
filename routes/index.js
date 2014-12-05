module.exports = function (models) {
  return {
    comment : require('./comment')(models),
    user : require('./user')(models)
  }
}
