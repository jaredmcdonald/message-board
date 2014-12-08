let UserDetailsView = require('./user-details-view');

module.exports = class AppView {

  constructor (Request, templates) {
    this.Request = Request;
    this.templates = templates;
    this.registry = {
      register : this.register.bind(this),
      call : this.callRegistered.bind(this)
    };
    this.registered = {};
  }

  initialize () {
    this.userDetailsView = new UserDetailsView(this.templates, this.Request, this.registry);
    return this;
  }

  // Register a shared function as `name`
  register (name, fn) {
    this.registered[name] = fn;
  }

  // Call the shared function at `name`
  callRegistered (name) {
    return this.registered[name]();
  }

}
