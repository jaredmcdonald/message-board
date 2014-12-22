let router = require('express').Router()
,   utils = require('../../modules/http-utils')
,   session = require('../../modules/session');

module.exports = function (models) {

  // GET all comments.
  // todo: add filter and pagination query params
  router.get('/', function (req, res) {
    models.comment.find({}, '-__v -_w').exec(function (err, comments) {
      if (err) return utils.internalServerError(res);

      utils.ok(res, comments, { loggedIn : session.isLoggedIn(req) });
    });
  });

  // GET the top 20 parentless (top-level) comments.
  router.get('/root', function(req, res) {
    getIndexData(models.comment, sendTopLevelThreads.bind(null, req, res));
  });

  // GET a specific comment.
  router.get('/:id', function (req, res) {
    models.comment.findById(req.params.id, '-__v -_w').exec(function (err, comment) {
      if (err) return utils.internalServerError(res);
      if (!comment) return utils.notFound(res);

      utils.ok(res, comment, { loggedIn : session.isLoggedIn(req) });
    });
  });

  for (let upOrDown of ['up', 'down']) {
    // POST to upvote or downvote a comment
    router.post(`/:id/${upOrDown}`, function (req, res) {
      if (!session.isLoggedIn(req)) return utils.notAuthorized(res, 'login required');

      newVote(session.getUserId(req), req.params.id, upOrDown === 'up', models.comment,
        voteResponseHandler.bind(null, session.getUserId(req), res, false));
    });

    // POST to remove a previous vote
    router.post(`/:id/${upOrDown}/remove`, function (req, res) {
      if (!session.isLoggedIn(req)) return utils.notAuthorized(res, 'login required');

      removeVote(session.getUserId(req), req.params.id, upOrDown === 'up', models.comment,
        voteResponseHandler.bind(null, session.getUserId(req), res, true));
    });
  };

  // GET a specific thread.
  router.get('/:id/thread', (req, res) =>
    getCommentThread(req.params.id, models, session.getUserId(req), sendThreadData.bind(null, req, res)));

  // DELETE a specific comment.
  router.delete('/:id', function (req, res) {
    models.comment.findByIdAndUpdate(req.params.id, { deleted : true }).exec(function (err, comment) {
      if (err) return utils.internalServerError(res);
      if (!comment) return utils.notFound(res);

      utils.noContent(res);
    });
  });

  // POST a new comment.
  router.post('/', function (req, res) {
    if (!session.isLoggedIn(req)) return utils.notAuthorized(res, 'login required');

    let comment = req.body;
    comment._author = session.getUserId(req);

    postNewComment(models, comment, function (err, newComment) {
      if (err) return utils.internalServerError(res);

      utils.created(res, newComment, { loggedIn : session.isLoggedIn(req) });
    });

  });

  return router;
}

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
  models.comment.GetArrayTree({ _id : id }, function (err, thread) {
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
  arr.forEach(item => { map[item._id] = item; });
  return map;
}

function walkThread (thread, map, userId) {
  if (userId) {
    thread = addUserVoted(userId, false, thread);
  }

  thread._author = map[thread._author];

  if (thread.children) {
    thread.children.sort((a, b) => b.points - a.points);
    thread.children.forEach(child => walkThread(child, map, userId));
  }

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

  CommentModel.findOne(queryObj, function (err, comment) {
    if (err) return callback(err, null);
    if (!comment) return callback(null, null);

    let index = comment.toObject()[type].findIndex((id) => id.toString() === userId);
    if (index === -1) return callback(null, null);

    comment[type].splice(index, 1);

    comment.save(function (err, savedComment) {
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
  }, function (err, comment) {
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

  new models.comment(comment).save(function (err, newComment) {
    if (err) callback (err, null);

    // Send HTTP response without waiting for association
    // with user; do that work in the background (below)
    newComment.populate('_author', callback);

    // Associate newly saved comment with its author
    models.user.findByIdAndUpdate(newComment._author, {
      $push : {
        _comments : newComment._id
      }
    }).exec(function (err, user) {
      console.log(err || 'successful association of comment ' + newComment._id + ' with user ' + user._id);
    });

  });
}