module.exports = (mongoose, materializedPlugin) => ({
  comment : require('./comment')(mongoose, materializedPlugin),
  user    : require('./user')(mongoose)
});
