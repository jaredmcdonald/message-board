module.exports = function (mongoose) {
  var userSchema = mongoose.Schema({
    _comments : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    username : String,
    pwHash   : String, // MD5 hash of password
    bio      : String,
    created  : Number,
    admin    : Boolean
  });

  userSchema.pre('save', function (next) {
    if (!this.created) {
      this.created = Date.now();
    }
    next();
  });

  return mongoose.model('User', userSchema);
}
