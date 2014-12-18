let defaults = {
  authFailed : true,
  loggedIn : false
};

module.exports = class UserDetailsModel {
  constructor (appEvents) {
    this.appEvents = appEvents;
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
