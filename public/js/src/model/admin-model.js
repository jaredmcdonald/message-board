module.exports = class AdminModel {

  constructor () {
    this.data = {
      data : []
    };
  }

  setData (data) {
    this.data = data;
  }

  updateUser (updatedUser) {
    let index = this.data.data.findIndex(user => user._id === updatedUser._id);
    if (index !== -1) {
      this.data.data[index] = updatedUser;
    }
  }

  addUser (user) {
    this.data.data.push(user);
  }

  deleteUser (id) {
    let index = this.data.data.findIndex(user => user._id === id);
    if (index !== -1) {
      this.data.data.splice(index, 1);
    }
  }

  getData () {
    return this.data;
  }
}
