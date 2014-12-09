module.exports = function (Request) {

  let basePath = '/api/v1/comment';

  function index (callback) {
    new Request(`${basePath}/root`)
      .error(console.error.bind(console))
      .handler(callback)
      .send();
  }

  function thread (id, callback) {
    new Request(`${basePath}/${id}/thread`)
      .error(console.error.bind(console))
      .handler(callback)
      .send();
  }

  function create (data, callback) {
    new Request(`${basePath}`, 'POST')
      .error(console.error.bind(console))
      .handler(callback)
      .send(data);
  }

  return {
    index,
    thread,
    create
  };
}
