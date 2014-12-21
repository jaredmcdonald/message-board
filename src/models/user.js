module.exports = function (mongoose) {
  var userSchema = mongoose.Schema({
    _comments : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    username : { type: String, required: true },
    pwHash   : { type: String, required: true }, // MD5 hash of password
    bio      : { type: String, default: '' },
    created  : Number,
    admin    : { type: Boolean, default: false }
  });

  userSchema.pre('save', function (next) {
    if (!this.created) {
      this.created = Date.now();
    }
    next();
  });

  return mongoose.model('User', userSchema);
}
