var express = require('express');
var router = express.Router();

module.exports = function (models) {
  router.post('/', function (req, res) {
    saveUser(models.user, req.body, res)
  })

  router.get('/', function (req, res) {
    models.user.find().exec(function (err, users) {
      if (err) return res.status(500).send({ status: 'error', error: err });

      res.status(200).send(users);
    })
  })

  router.get('/:id', function (req, res) {
    models.user.findById(req.params.id).exec(function (err, user) {
      if (err) return res.status(500).send({ status: 'error', error: err });
      if (!user) return res.status(404).send({ status: 'error', error: 'not found' });

      res.status(200).send(user);
    })
  })

  router.delete('/:id', function (req, res) {
    models.user.findByIdAndRemove(req.params.id).exec(function (err, user) {
      if (err) return res.status(500).send({ status: 'error', error: err });
      if (!user) return res.status(404).send({ status: 'error', error: 'not found'});

      res.status(204).send();
    });
  })

  return router;
}

function saveUser (UserModel, user, res) {
  // todo - check fields of `user`

  new UserModel(user).save(function (err, newUser) {
    if (err) return res.status(500).send({ status: 'error', error: err });

    res.status(201).send({
      status : 'created',
      id : newUser._id
    });
  });
}
