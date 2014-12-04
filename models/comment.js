module.exports = function (mongoose) {
  var commentSchema = mongoose.Schema({
    _author    : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    _children  : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    _parent    : { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    hasParent : Boolean,
    content   : String,
    created   : Number,
    points    : Number
  });

  commentSchema.pre('save', function (next) {
    if (!this.created) {
      this.created = Date.now();
    }
    next();
  });

  return mongoose.model('Comment', commentSchema);
}
