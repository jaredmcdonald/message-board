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

  updateComment (comment) {
    let target = this.getData().data.findIndex((c) => comment._id === c._id);
    if (target === -1) return false;
    this.data.data[target] = comment;
  }

  getData () {
    return this.data;
  }
}
