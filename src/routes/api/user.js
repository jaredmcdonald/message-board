let router = require('express').Router();

module.exports = controller => {

  router.get('/login', controller.userDetails);
  router.get('/:id', controller.getUser);
  router.get('/', controller.getAllUsers);

  router.patch('/:id', controller.editUser);

  router.delete('/:id', controller.deleteUser);

  router.post('/', controller.newUser);
  router.post('/login', controller.login);
  router.post('/logout', controller.logout);

  return router;
}
