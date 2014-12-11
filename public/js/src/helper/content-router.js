module.exports = class ContentRouter {

  constructor () {
    const noop = function () {},
    regexes = {
      thread : /^#\/comment\/([a-f0-9]{24})$/,
      submit : /^#\/submit(?:\/)?$/
    };

    this.regexes = regexes;
    this.callbacks = {
      index  : noop,
      thread : noop,
      submit : noop
    };

    this.initialized = false;
  }

  pushState (data, url) {
    window.history.pushState(data, '', url)
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
    if (this.regexes.submit.test(window.location.hash)) {
      return this.callbacks.submit();
    }

    let match = window.location.hash.match(this.regexes.thread);

    if (match) {
      this.callbacks.thread(match[1]);
    } else {
      this.callbacks.index()
    }
  }

}
