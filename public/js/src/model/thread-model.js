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

  updateItem (item, sortAfterUpdate = true) {
    if (item.path !== '') {
      let path = item.path.split(',');
      path.splice(0, 2);
      let parent = this.walkTree(path, this.getData().data)
      ,   index = parent.children.findIndex((child) => child._id === item._id)
      ,   _children = parent.children[index].children;
      parent.children[index] = item;
      parent.children[index].children = _children;

      sortAfterUpdate && this.sort(parent);
    } else {
      // top-level thread item (root)
      let _children = this.data.data.children;
      this.data.data = item;
      this.data.data.children = _children;
    }
  }

  sort (start) {
    start.children.sort((a, b) => b.points - a.points);
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
