module.exports = function (mongoose, materializedPlugin) {
  var commentSchema = mongoose.Schema({
    _author   : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true },
    title     : { type: String, required : true },
    content   : { type: String, required : true },
    upvotes   : { type: [ mongoose.Schema.Types.ObjectId ], ref: 'User' },
    downvotes : { type: [ mongoose.Schema.Types.ObjectId ], ref: 'User' },
    points    : { type: Number, default: 0 },
    created   : Number,
    deleted   : { type: Boolean, default : false }
  });

  // Use "materialized path" strategy for comment tree structure.
  // http://docs.mongodb.org/manual/tutorial/model-tree-structures-with-materialized-paths/
  // (w/ this mongoose implementation: https://www.npmjs.org/package/mongoose-materialized)
  commentSchema.plugin(materializedPlugin);

  commentSchema.pre('save', function (next) {
    if (!this.created) {
      this.created = Date.now();
    }
    this.points = this.upvotes.length - this.downvotes.length;
    next();
  });

  return mongoose.model('Comment', commentSchema);
}
