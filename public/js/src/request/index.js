// A thin wrapper around XMLHttpRequest.
module.exports = class Request {

  constructor (url, method = 'GET') {
    this.xhr = new XMLHttpRequest();
    this.xhr.open(method.toUpperCase(), url);
    this.xhr.setRequestHeader('Content-Type', 'application/json');
  }

  handler (callback) {
    this.xhr.onload = event => {
      if (this.xhr.response) {
        callback(JSON.parse(this.xhr.response));
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
