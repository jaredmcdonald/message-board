var express = require('express');
var router = express.Router();

module.exports = function (models) {

  // GET all comments.
  // todo: add filter and pagination query params
  router.get('/', function (req, res) {
    models.comment.find().exec(function (err, comments) {
      if (err) return res.status(500).send({ status: 'error', error : err });

      res.status(200).send(comments);
    });
  });

  // GET the top 20 parentless (top-level) comments.
  router.get('/root', function(req, res) {
    getIndexData(models.comment, sendTopLevelThreads.bind(null, res));
  });

  // GET a specific comment.
  router.get('/:id', function (req, res) {
    models.comment.findById(req.params.id).exec(function (err, comment) {
      if (err) return res.status(500).send({ status: 'error', error : err });
      if (!comment) return res.status(404).send({ status : 'error', error : 'not found' });

      res.status(200).send(comment);
    });
  });

  // GET a specific thread.
  router.get('/:id/thread', function (req, res) {
    getCommentThread(req.params.id, models, sendThreadData.bind(null, res))
  })

  // DELETE a specific comment.
  router.delete('/:id', function (req, res) {
    models.comment.findByIdAndUpdate(req.params.id, { deleted : true }).exec(function (err, comment) {
      if (err) return res.status(500).send({ status : 'error', error : err });
      if (!comment) return res.status(404).send({ status : 'error', error : 'not found' });

      res.status(204).send();
    })
  })

  // POST a new comment.
  router.post('/', function (req, res) {
    postNewComment(models, req.body, function (err, id) {
      if (err) return res.status(500).send({ status: 'error', error : err });

      res.status(201).send({ status : 'created', id : id });
    });
  })

  return router;
}

function sendTopLevelThreads (res, err, comments) {
  if (err) return res.status(500).send({ status : 'error', error : err });

  res.status(200).send(comments);
}

function sendThreadData (res, err, thread) {
  if (err) return res.status(500).send({ status : 'error', error : err });
  if (!thread) return res.status(404).send({ status : 'error', error : 'not found' });

  res.status(200).send(thread);
}

// DB query for root-level threads
function getIndexData (CommentModel, callback) {
  CommentModel.find({ parentId : null })
              .sort('-points')
              .limit(20)
              .populate('_author')
              .exec(callback);
}

// DB query for comment thread
function getCommentThread (id, models, callback) {
  models.comment.GetArrayTree({ _id : id }, function (err, thread) {
    if (err) return callback (err, null);

    populateAuthors(thread[0], models, callback); // index 0 because we don't need the
                                                  // array wrapper with just one element
  });
}

function populateAuthors (thread, models, callback) {
  var authors = getAuthors(thread);

  models.user.find({
    _id : {
      $in : authors
    }
  }, 'username _id').exec(function (err, authors) {
    if (err) return callback(err, null);

    callback(null, matchAuthor(thread, arrayToMap(authors)));
  })
}

function arrayToMap (arr) {
  var map = {};
  arr.forEach(function (item) {
    map[item._id] = item;
  });
  return map;
}

function matchAuthor (thread, map) {
  thread._author = map[thread._author];

  if (thread.children) {
    thread.children.forEach(function (child) {
      matchAuthor(child, map);
    });
  }

  return thread;
}

// Given an ArrayTree, return an array of
// `_author`s contained within it
function getAuthors (item, arr) {
  arr = arr || [];

  if (arr.indexOf(item._author) === -1) {
    arr.push(item._author)
  }

  if (item.children) {
    item.children.forEach(function (item) {
      getAuthors(item, arr);
    });
  }

  return arr;
}

function postNewComment(models, comment, callback) {
  // todo: error check fields of POSTed comment

  new models.comment(comment).save(function (err, newComment) {

    // Send HTTP response without waiting for association
    // with user; do that work in the background (below)
    callback(err, newComment._id)

    // Associate newly saved comment with its author
    models.user.findByIdAndUpdate(newComment._author, {
      $push : {
        _comments : newComment._id
      }
    }).exec(function (err, user) {
      console.log(err || 'successful association of comment ' + newComment._id + ' with user ' + user._id);
    });

  })
}
