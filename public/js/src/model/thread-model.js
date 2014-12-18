module.exports = class ThreadModel {
  constructor (id) {
    this.id = id;
    this.data = {};
  }

  setData (response) {
    this.data = response;
  }

  insert (item) {
    let path = item.path.split(',');
    path.splice(0, 2);

    let parent = this.walkTree(path, this.getData().data);

    if (!parent.children) {
      parent.children = [];
    }

    parent.children.push(item);
  }

  setLoggedIn (isLoggedIn) {
    this.data.loggedIn = isLoggedIn;
  }

  walkTree (path, item) {
    if (path.length === 0) {
      return item;
    }

    var branch = item.children.find((child) => child._id === path[0]);

    path.shift();

    return this.walkTree(path, branch);
  }

  getData () {
    return this.data;
  }
}
