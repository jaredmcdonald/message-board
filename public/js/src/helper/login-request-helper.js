module.exports = function (Request) {

  let basePath = '/api/v1/user';

  function checkLogin (callback) {
    new Request(`${basePath}/login`)
      .error(console.error.bind(console))
      .handler(callback)
      .send();
  }

  function login (data, callback) {
    new Request(`${basePath}/login`, 'POST')
      .error(console.error.bind(console))
      .handler(callback)
      .send(data);
  }

  function logout (callback) {
    new Request(`${basePath}/logout`, 'POST')
      .error(console.error.bind(console))
      .handler(callback)
      .send({});
  }

  return {
    checkLogin,
    login,
    logout
  };
}
