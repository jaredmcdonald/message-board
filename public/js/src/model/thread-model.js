module.exports = class ThreadModel {
  constructor (id) {
    this.id = id;
  }

  setData (response) {
    this.data = response.data;
  }

  insert (item) {
    let path = item.path.split(',');
    path.splice(0, 2);

    let parent = this.walkTree(path, this.getData());

    if (!parent.children) {
      parent.children = [];
    }

    parent.children.push(item);
  }

  walkTree (path, item) {
    if (path.length === 0) {
      return item;
    }

    var branch = item.children.find(function (child) {
      return child._id === path[0];
    });

    path.shift();

    return this.walkTree(path, branch);
  }

  getData () {
    return this.data;
  }
}
