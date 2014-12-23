let Request = require('../request');

module.exports = () => {

  let basePath = '/api/v1/user';

  function getUsers (callback) {
    new Request(basePath)
      .error(console.error.bind(console))
      .handler(callback)
      .send();
  }

  function newUser (data, callback) {
    new Request(basePath, 'POST')
      .error(console.error.bind(console))
      .handler(callback)
      .send(data);
  }

  function patchUser (id, data, callback) {
    new Request(`${basePath}/${id}`, 'PATCH')
      .error(console.error.bind(console))
      .handler(callback)
      .send(data);
  }

  function deleteUser (id, callback) {
    new Request(`${basePath}/${id}`, 'DELETE')
      .error(console.error.bind(console))
      .handler(callback)
      .send({});
  }

  return {
    getUsers,
    newUser,
    patchUser,
    deleteUser
  };
}
