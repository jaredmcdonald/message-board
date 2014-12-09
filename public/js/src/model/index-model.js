module.exports = class IndexModel {
  constructor () {
    
  }

  setData (response) {
    this.data = response.data;
  }

  getData () {
    return this.data;
  }
}
