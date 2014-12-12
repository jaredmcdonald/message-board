let IndexModel = require('../model/index-model');

module.exports = class IndexView {
  constructor (parentView, data, isPageLoad) {
    this.parentView = parentView;
    this.isPageLoad = isPageLoad;
    this.el = parentView.el;
    this.templates = parentView.templates;
    this.request = parentView.requests.index;
    this.appEvents = parentView.appEvents;
    this.appRegistry = parentView.appRegistry;
    this.parentView = parentView;
    this.router = parentView.router;
    this.model = new IndexModel();

    const events = {
      click : 'click.content',
      login : 'login'
    },
    namespace = 'IndexView',
    url = '#/';

    this.events = events;
    this.namespace = namespace;
    this.url = url;

    this.fromPopState = false;

    if (data) {
      this.fromPopState = true;
      this.model.setData({ data });
    }

    this.initialize();
  }

  initialize () {
    this.bindEvents();

    if (!this.fromPopState) {
      this.request(this.handleResponse.bind(this));
    } else {
      this.render();
    }
  }

  loginHandler (data) {
    this.render(data.isLoggedIn);
  }

  handleResponse (data) {
    this.model.setData(data);

    this.router[this.isPageLoad ? 'replaceState' : 'pushState'](this.model.getData(), this.url);

    this.render();
  }

  render (isLoggedIn) {
    isLoggedIn = typeof isLoggedIn === 'boolean' ? isLoggedIn : this.appRegistry.get('isLoggedIn');
    this.el.innerHTML = this.templates.index.render({
      isLoggedIn,
      items: this.model.getData()
    });
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
    this.appEvents.listen(this.events.click, this.namespace, this.clickListener.bind(this));
    this.appEvents.listen(this.events.login, this.namespace, this.loginHandler.bind(this));
  }

  unbind () {
    this.appEvents.remove(this.events.click, this.namespace);
    this.appEvents.remove(this.events.login, this.namespace);
  }
}
