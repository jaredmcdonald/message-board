let crypto = require('crypto');

// turn a password into a md5 checksum for storage
exports.hashPassword = (pw) => {
  let hash = crypto.createHash('md5');
  hash.write(pw);
  return hash.digest('hex');
}
