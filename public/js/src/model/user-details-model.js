let defaults = {
  authFailed : true,
  loggedIn : false
};

module.exports = class UserDetailsModel {
  constructor () {
    this.setData(defaults)
  }

  setData (data) {
    if (data.data) {
      this.data = data.data;
      this.data.authFailed = false;
    } else {
      this.data = defaults;
    }
  }

  getData () {
    return this.data;
  }

  get loggedIn () {
    return this.data.loggedIn;
  }
}
