module.exports = function (mongoose, materializedPlugin) {
  return {
    comment : require('./comment')(mongoose, materializedPlugin),
    user    : require('./user')(mongoose)
  }
}
