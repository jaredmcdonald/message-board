let router = require('express').Router();

module.exports = controller => {

  router.get('/', controller.getAllComments);
  router.get('/root', controller.getRootComments);
  router.get('/:id', controller.getComment);
  router.get('/:id/thread', controller.getThread);

  router.patch('/:id', controller.editComment);

  router.delete('/:id', controller.deleteComment);

  router.post('/', controller.newComment);
  router.post('/:id/:upOrDown(up|down)', controller.addVote);
  router.post('/:id/:upOrDown(up|down)/remove', controller.removeVote);

  return router;
}
