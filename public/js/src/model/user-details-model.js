let defaults = {
  authFailed : true,
  loggedIn : false
};

module.exports = class UserDetailsModel {
  constructor (appRegistry, appEvents) {
    this.appEvents = appEvents;
    this.appRegistry = appRegistry;

    let self = this;
    this.appRegistry.register('isLoggedIn', function () {
      return self.loggedIn;
    });

    this.setData(defaults);
  }

  setData (data) {
    if (data.data) {
      this.data = data.data;
      this.data.authFailed = false;
    } else {
      this.data = defaults;
    }

    this.appEvents.trigger('login', this.getData());
  }

  getData () {
    return this.data;
  }

  get loggedIn () {
    return this.data.loggedIn;
  }
}
