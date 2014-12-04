module.exports = function (mongoose) {
  return {
    comment : require('./comment')(mongoose),
    user    : require('./user')(mongoose)
  }
}
