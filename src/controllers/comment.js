let utils = require('../modules/http-utils')
,   session = require('../modules/session');

module.exports = models => ({
  // GET all comments.
  getAllComments : (req, res) => {
    models.comment.find({}, '-__v -_w').exec((err, comments) => {
      if (err) return utils.internalServerError(res);
      utils.ok(res, comments, { loggedIn : session.isLoggedIn(req) });
    });
  },

  // GET parentless (top-level) comments.
  getRootComments : (req, res) => {
    getIndexData(models.comment, sendTopLevelThreads.bind(null, req, res));
  },

  // GET a specific comment.
  getComment : (req, res) => {
    models.comment.findById(req.params.id, '-__v -_w').exec((err, comment) => {
      if (err) return utils.internalServerError(res);
      if (!comment) return utils.notFound(res);

      utils.ok(res, comment, { loggedIn : session.isLoggedIn(req) });
    });
  },

  // GET a specific thread.
  getThread : (req, res) =>
    getCommentThread(req.params.id, models, session.getUserId(req), sendThreadData.bind(null, req, res)),

  // DELETE a specific comment.
  deleteComment: (req, res) => {
    models.comment.findByIdAndUpdate(req.params.id, { deleted : true }).exec((err, comment) => {
      if (err) return utils.internalServerError(res);
      if (!comment) return utils.notFound(res);

      utils.noContent(res);
    });
  },

  // PATCH to edit a specific comment.
  // TODO: cleanup callback mess
  editComment : (req, res) => {
    if (!session.isLoggedIn(req)) return utils.notAuthorized(res, 'login required');
    if (!req.body.content && !req.body.title) return utils.badRequest(res);

    models.comment.findById(req.params.id).exec((err, comment) => {
      if (err) return utils.internalServerError(res);
      if (comment._author.toString() !== session.getUserId(req)) return utils.notAuthorized(res);

      if (req.body.content) comment.content = req.body.content;
      if (req.body.title) comment.title = req.body.title;

      comment.save((saveErr, updatedComment) => {
        if (saveErr) return utils.internalServerError(res);
        utils.ok(res, updatedComment);
      });
    });
  },

  // POST a new comment.
  newComment : (req, res) => {
    if (!session.isLoggedIn(req)) return utils.notAuthorized(res, 'login required');

    let comment = req.body;
    comment._author = session.getUserId(req);

    postNewComment(models, comment, (err, newComment) => {
      if (err) return utils.internalServerError(res);

      let c = newComment.toObject();
      c.editable = true; // if the user created a comment,
                         // she should be able to edit it

      utils.created(res, c, { loggedIn : session.isLoggedIn(req) });
    });
  },

  // POST to upvote or downvote a comment.
  addVote : (req, res) => {
    if (!session.isLoggedIn(req)) return utils.notAuthorized(res, 'login required');

    newVote(session.getUserId(req), req.params.id, req.params.upOrDown === 'up', models.comment,
      voteResponseHandler.bind(null, session.getUserId(req), res, false));
  },

  // POST to remove a previous vote.
  removeVote : (req, res) => {
    if (!session.isLoggedIn(req)) return utils.notAuthorized(res, 'login required');

    removeVote(session.getUserId(req), req.params.id, req.params.upOrDown === 'up', models.comment,
      voteResponseHandler.bind(null, session.getUserId(req), res, true));
  }
});


// PRIVATE UTILITY FUNCTIONS
// TODO: modularize

function sendTopLevelThreads (req, res, err, comments) {
  if (err) return utils.internalServerError(res);

  let loggedIn = session.isLoggedIn(req);

  if (loggedIn) {
    comments = comments.map(addUserVoted.bind(null, session.getUserId(req), true));
  }

  utils.ok(res, comments, { loggedIn });
}

function sendThreadData (req, res, err, thread) {
  if (err) return utils.internalServerError(res);
  if (!thread) return utils.notFound(res);

  utils.ok(res, thread, { loggedIn : session.isLoggedIn(req) });
}

// DB query for root-level threads
function getIndexData (CommentModel, callback) {
  CommentModel.find({ parentId : null }, '-__v -_w')
              .sort('-points')
              .populate('_author')
              .exec(callback);
}

// DB query for comment thread
function getCommentThread (id, models, userId, callback) {
  // TODO remove '__v' and '_w'
  models.comment.GetArrayTree({ _id : id }, (err, thread) => {
    if (err) return callback (err, null);

    populateThread(thread[0], models, userId, callback); // index 0 because we don't need the
                                                         // array wrapper with just one element
  });
}

function populateThread (thread, models, userId, callback) {
  let authors = getAuthors(thread);

  models.user.find({
    _id : {
      $in : authors
    }
  }, 'username _id').exec((err, authors) =>
    callback(err, walkThread(thread, arrayToMap(authors), userId)));
}

function arrayToMap (arr) {
  let map = {};
  arr.forEach(item => map[item._id] = item);
  return map;
}

function walkThread (thread, map, userId) {
  if (userId) {
    thread = addUserVoted(userId, false, thread);
    thread = addEditable(userId, thread);
  }

  thread._author = map[thread._author];

  if (thread.children) {
    thread.children.sort((a, b) => b.points - a.points);
    thread.children.forEach(child => walkThread(child, map, userId));
  }

  return thread;
}

// Add `editable` property to a thread item
function addEditable (userId, thread) {
  thread.editable = userId === thread._author.toString();
  return thread;
}

// `convert`: whether or not to convert from `Mongoose.Collection`
// (i.e., whether to call `toObject` on `comment`)
function addUserVoted (userId, convert, comment) {
  let match = matchId.bind(null, userId);
  if (convert) {
    comment = comment.toObject();
  }
  comment.userUpvoted = !!comment.upvotes.find(match);
  comment.userDownvoted = comment.userUpvoted ? false : !!comment.downvotes.find(match);
  return comment;
}

function matchId (userId, id) {
  return id.toString() === userId;
}

// Given an ArrayTree, return an array of
// `_author`s contained within it
function getAuthors (item, arr = []) {
  if (arr.indexOf(item._author) === -1) {
    arr.push(item._author)
  }

  if (item.children) {
    item.children.forEach(child => getAuthors(child, arr));
  }

  return arr;
}

function voteResponseHandler (userId, res, isRemoval, err, updatedComment) {
  if (err) return utils.internalServerError(res);
  if (!updatedComment) return utils.notAuthorized(res, isRemoval ?
    'no vote to remove' : 'can only vote once per comment');

  utils.ok(res, addUserVoted(userId, true, updatedComment));
}

function removeVote (userId, commentId, isUpvote, CommentModel, callback) {
  let queryObj = {
    _id  : commentId
  },
  type = isUpvote ? 'upvotes' : 'downvotes';

  queryObj[type] = {
    $in : [ userId ]
  };

  CommentModel.findOne(queryObj, (err, comment) => {
    if (err) return callback(err, null);
    if (!comment) return callback(null, null);

    let index = comment.toObject()[type].findIndex((id) => id.toString() === userId);
    if (index === -1) return callback(null, null);

    comment[type].splice(index, 1);

    comment.save((err, savedComment) => {
      if (err) return callback(err, null);
      savedComment.populate('_author', callback);
    });

  });
}

function newVote (userId, commentId, isUpvote, CommentModel, callback) {
  CommentModel.findOne({
    _id  : commentId,
    $nor : [
      {
        upvotes : {
          $in : [ userId ]
        }
      },
      {
        downvotes : {
          $in : [ userId ]
        }
      }
    ]
  }, (err, comment) => {
    if (err) return callback(err, null);
    if (!comment) return callback(null, null);

    comment[isUpvote ? 'upvotes' : 'downvotes'].push(userId);
    comment.save(function (err, newComment) {
      if (err) return callback(err, null);
      newComment.populate('_author', callback);
    });
  });
}

function postNewComment (models, comment, callback) {
  // todo: error check fields of POSTed comment

  new models.comment(comment).save((err, newComment) => {
    if (err) callback (err, null);

    newComment.populate('_author', callback);
  });
}
