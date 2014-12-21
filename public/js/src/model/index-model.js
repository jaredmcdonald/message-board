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

  updateComment (comment, sortAfterUpdate = true) {
    let target = this.getData().data.findIndex((c) => comment._id === c._id);
    if (target === -1) return false;
    this.data.data[target] = comment;
    sortAfterUpdate && this.sort();
  }

  sort () {
    this.data.data = this.getData().data.sort((a, b) => b.points - a.points);
  }

  getData () {
    return this.data;
  }
}
