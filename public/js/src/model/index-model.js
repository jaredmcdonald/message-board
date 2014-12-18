module.exports = class IndexModel {
  constructor () {
    this.data = {};
  }

  setData (response) {
    this.data = response;
  }

  setLoggedIn (isLoggedIn) {
    this.data.loggedIn = isLoggedIn;
  }

  getData () {
    return this.data;
  }
}
