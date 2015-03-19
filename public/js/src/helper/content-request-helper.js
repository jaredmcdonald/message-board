module.exports = Request => {

  const basePath = '/api/v1/comment';

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

  function getItem (id, callback) {
    new Request(`${basePath}/${id}`)
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

  function vote (id, type, callback) {
    new Request(`${basePath}/${id}/${type}`, 'POST')
      .error(console.error.bind(console))
      .handler(callback)
      .send();
  }

  function edit (id, data, callback) {
    new Request(`${basePath}/${id}`, 'PATCH')
      .error(console.error.bind(console))
      .handler(callback)
      .send(data);
  }
  

  return {
    index,
    thread,
    create,
    vote,
    getItem,
    edit
  };
}
