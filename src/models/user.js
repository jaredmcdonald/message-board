module.exports = function (mongoose) {
  let userSchema = mongoose.Schema({
    _comments : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    username : { type: String, required: true },
    pwHash   : { type: String, required: true, select: false }, // MD5 hash of password
    bio      : { type: String, default: '' },
    created  : Number,
    admin    : { type: Boolean, default: false, select: false }
  });

  // leave this as standard (non-arrow) function
  // to preserve dynamic `this` binding
  userSchema.pre('save', function (next) {
    if (!this.created) {
      this.created = Date.now();
    }
    next();
  });

  return mongoose.model('User', userSchema);
}
