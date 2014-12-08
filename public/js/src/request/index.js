// A thin wrapper around XMLHttpRequest.
module.exports = class Request {
  constructor (url, method = 'GET') {
    this.xhr = new XMLHttpRequest();
    this.xhr.open(method.toUpperCase(), url);
    this.xhr.setRequestHeader('Content-Type', 'application/json');
  }
  success (callback) {
    var self = this;
    this.xhr.onload = function (event) {
      if (self.xhr.response) {
        callback(JSON.parse(self.xhr.response));
      } else {
        // contentless responses
        callback();
      }

    };
    return this;
  }
  error (callback) {
    this.xhr.onerror = callback;
    return this;
  }
  send (data) {
    this.xhr.send(JSON.stringify(data));
    return this;
  }
}
