module.exports = class ContentRouter {

  constructor () {
    const noop = () => {},
    regexes = {
      thread   : /^#\/comment\/([a-f0-9]{24})$/,
      submit   : /^#\/submit(?:\/)?$/,
      register : /^#\/register(?:\/)?$/,
      admin    : /^#\/admin(?:\/)?$/
    };

    this.regexes = regexes;
    this.callbacks = {
      index    : noop,
      thread   : noop,
      submit   : noop,
      admin    : noop,
      register : noop
    };

    this.initialized = false;
  }

  pushState (data, url) {
    window.history.pushState(data, '', url);
  }

  replaceState (data) {
    window.history.replaceState(data, '', window.location.hash);
  }

  back () {
    window.history.back();
  }

  initialize () {
    if (this.initialized) return false;

    window.addEventListener('popstate', this.route.bind(this, true));
    this.route(false);

    this.initialized = true;
    return this;
  }

  register (type, callback) {
    this.callbacks[type] = callback;
  }

  route (isFromPopState, event = { state : null }) {
    if (this.regexes.submit.test(window.location.hash)) {
      return this.callbacks.submit(!event.state, isFromPopState);
    }

    if (this.regexes.register.test(window.location.hash)) {
      return this.callbacks.register(!event.state, isFromPopState);
    }

    if (this.regexes.admin.test(window.location.hash)) {
      return this.callbacks.admin(event.state, !event.state);
    }

    let match = window.location.hash.match(this.regexes.thread);

    if (match) {
      this.callbacks.thread(match[1], event.state, !event.state);
    } else {
      this.callbacks.index(event.state, !event.state);
    }
  }

}
