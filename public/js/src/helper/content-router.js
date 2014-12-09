const thread = /^#\/comment\/([a-f0-9]{24})$/;

module.exports = class ContentRouter {

  constructor () {
    this.callbacks = {
      index  : function () {},
      thread : function () {}
    };
    this.initialized = false;
  }

  initialize () {
    if (this.initialized) return false;

    window.addEventListener('hashchange', this.route.bind(this));
    this.route();

    this.initialized = true;
    return this;
  }

  register (type, callback) {
    this.callbacks[type] = callback;
  }

  route () {
    let match = window.location.hash.match(thread);

    if (match) {
      this.callbacks.thread(match[1]);
    } else {
      this.callbacks.index()
    }
  }

}
