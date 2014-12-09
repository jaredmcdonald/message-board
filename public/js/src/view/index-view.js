let IndexModel = require('../model/index-model');

module.exports = class IndexView {
  constructor (parentView) {
    this.el = parentView.el;
    this.templates = parentView.templates;
    this.request = parentView.requests.index;
    this.registry = parentView.registry;
    this.parentView = parentView;
    this.model = new IndexModel();
    this.initialize();
  }

  initialize () {
    this.createBoundHandlers();
    this.bindEvents();
    this.request(this.handleResponse.bind(this));
  }

  handleResponse (data) {
    this.model.setData(data);
    this.render();
  }

  render () {
    this.el.innerHTML = this.templates.index.render({
      items: this.model.getData()
    });
  }

  createBoundHandlers () {
    this.bound = {
      click : this.clickListener.bind(this)
    };
  }

  clickListener (event) {
    if (/item-link/.test(event.target.className)) {
      event.preventDefault();
      this.parentView.thread(event.target.dataset.id);
    }
  }

  bindEvents () {
    this.el.addEventListener('click', this.bound.click);
  }

  unbind () {
    this.el.removeEventListener('click', this.bound.click);
  }
}
