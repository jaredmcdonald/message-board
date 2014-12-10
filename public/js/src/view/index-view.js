let IndexModel = require('../model/index-model');

module.exports = class IndexView {
  constructor (parentView) {
    this.el = parentView.el;
    this.templates = parentView.templates;
    this.request = parentView.requests.index;
    this.appEvents = parentView.appEvents;
    this.appRegistry = parentView.appRegistry;
    this.parentView = parentView;
    this.model = new IndexModel();
    this.initialize();
  }

  initialize () {
    this.createBoundHandlers();
    this.bindEvents();
    this.request(this.handleResponse.bind(this));

    this.appEvents.listen('login', this.loginHandler.bind(this));
  }

  loginHandler (data) {
    this.render(data.isLoggedIn);
  }

  handleResponse (data) {
    this.model.setData(data);
    this.render();
  }

  render (isLoggedIn) {
    isLoggedIn = typeof isLoggedIn === 'boolean' ? isLoggedIn : this.appRegistry.get('isLoggedIn');
    this.el.innerHTML = this.templates.index.render({
      isLoggedIn,
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
    } else if (/submit-link/.test(event.target.className)) {
      event.preventDefault();
      this.parentView.submitForm();
    }
  }

  bindEvents () {
    this.el.addEventListener('click', this.bound.click);
  }

  unbind () {
    this.el.removeEventListener('click', this.bound.click);
  }
}
