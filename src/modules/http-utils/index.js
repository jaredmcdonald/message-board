/*
 *  common http API tasks
 *
 */

const codes = require('http').STATUS_CODES;

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
exports.badRequest = (res, error = codes[400]) => respond(res, 400, { error });

// 401 Not Authorized
exports.notAuthorized = (res, error = codes[401]) => respond(res, 401, { error });

// 404 Not Found
exports.notFound = (res, error = codes[404]) => respond(res, 404, { error });

// 500 Internal Server Error
exports.internalServerError = (res, error = codes[500]) => respond(res, 500, { error });

// 501 Not Implemented
exports.notImplemented = (res, error = codes[501]) => respond(res, 501, { error });
