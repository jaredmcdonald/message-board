var express = require('express');
var router = express.Router();
var Promise = require('bluebird');

module.exports = function (models) {

  // Render all of the parentless (top-level) comments.
  router.get('/', function(req, res) {
    getIndexData(models.comment, sendTopLevelThreads.bind(null, res));
  });

  // GET a specific thread.
  // not working yet
  router.get('/comment/:id/thread', function (req, res) {
    getCommentThread(req.params.id, models.comment, sendCommentData.bind(null, res))
  })

  // GET all comments.
  // todo: add filter and pagination query params
  router.get('/comment', function (req, res) {
    models.comment.find().exec(function (err, comments) {
      if (err) return res.status(500).send({ status: 'error', error : err });

      res.status(200).send(comments);
    });
  });

  // GET a specific comment.
  router.get('/comment/:id', function (req, res) {
    models.comment.findById(req.params.id).exec(function (err, comment) {
      if (err) return res.status(500).send({ status: 'error', error : err });

      res.status(200).send(comment);
    });
  });

  // POST a new comment.
  router.post('/comment', function (req, res) {
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

function sendCommentData (res, err, comment) {
  if (err) return res.status(500).send({ status : 'error', error : err });
  if (!comment) return res.status(404).send({ status : 'error', error : 'not found' });

  res.status(200).send(comment);
}

// DB query for index page
function getIndexData (CommentModel, callback) {
  CommentModel.find({ hasParent : false })
              .sort('-points')
              .limit(20)
              .populate('_author')
              .exec(callback);
}

// DB query for comment thread
function getCommentThread (id, CommentModel, callback) {
  CommentModel.findById(id)
              .exec(function (err, comment) {
                populateChildren(CommentModel, comment).then(callback.bind(null, err));
              });
}

// Recursively populate children
// todo: fix
function populateChildren(CommentModel, comment) {
  return CommentModel.populate(comment, { path: '_children' }).then(function(subcomment) {
    return subcomment.children.length ? populateChildren(CommentModel, subcomment.children) : Promise.fulfill(subcomment);
  });
}

function postNewComment(models, comment, callback) {
  // todo: error check fields of POSTed comment

  new models.comment(comment).save(function (err, newComment) {

    // Send HTTP response without waiting for associations with
    // other models; do that work in the background (below)
    callback(err, newComment._id)

    // Associate newly saved comment with its parent, if it has one
    if (newComment.hasParent) {
      models.comment.findByIdAndUpdate(newComment._parent, {
        $push : {
          _children : newComment._id
        }
      }).exec(function (err, parent) {
        console.log(err || 'successful association of comment ' + newComment._id + ' with parent ' + parent._id);
      });
    }

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
