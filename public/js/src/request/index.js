// A thin wrapper around XMLHttpRequest.
module.exports = class Request {
  constructor (url, method = 'GET') {
    this.xhr = new XMLHttpRequest();
    this.xhr.open(method.toUpperCase(), url);
  }
  success (callback) {
    var self = this;
    this.xhr.onload = function (event) {
      callback (JSON.parse(self.xhr.response));
    };
    return this;
  }
  error (callback) {
    this.xhr.onerror = callback;
    return this;
  }
  send () {
    this.xhr.send();
    return this;
  }
}
