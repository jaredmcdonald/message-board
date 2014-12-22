/*
 *  common http API tasks
 *
 */

function respond (res, status, data) {
  res.status(status);

  // contentless response
  if (typeof data !== 'object') {
    return res.end();
  }

  res.send(data);
}

function addData (obj, data) {
  if (typeof data === 'object') {
    Object.keys(data).forEach(key => obj[key] = data[key]);
  }
  return obj;
}

/*
 *  responses
 *
 */

// 200 OK
exports.ok = (res, data, metadata) => respond(res, 200, addData({ data }, metadata));

// 201 Created
exports.created = (res, data, metadata) => respond(res, 201, addData({ data }, metadata));

// 204 No Content
exports.noContent = res => respond(res, 204);

// 400 Bad Request
exports.badRequest = (res, msg) => respond(res, 400, { error : msg || 'bad request' });

// 401 Not Authorized
exports.notAuthorized = (res, msg) => respond(res, 401, { error : msg || 'must be logged in to perform specified action' });

// 404 Not Found
exports.notFound = (res, msg) => respond(res, 404, { error : msg || 'resource does not exist' });

// 500 Internal Server Error
exports.internalServerError = (res, msg) => respond(res, 500, { error : msg || 'error processing request' });

// 501 Not Implemented
exports.notImplemented = (res, msg) => respond(res, 501, { error : msg || 'request not implemented' });
