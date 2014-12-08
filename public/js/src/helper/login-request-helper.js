module.exports = function (Request) {

  function checkLogin (callback) {
    new Request('/api/v1/user/login')
      .error(console.error.bind(console))
      .handler(callback)
      .send();
  }

  function login (data, callback) {
    new Request('/api/v1/user/login', 'POST')
      .error(console.error.bind(console))
      .handler(callback)
      .send(data);
  }

  function logout (callback) {
    new Request('/api/v1/user/logout', 'POST')
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
