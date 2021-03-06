let contentRequestHelper = require('../helper/content-request-helper'),
    ContentRouter = require('../helper/content-router'),
    SubmitView = require('./submit-view'),
    IndexView = require('./index-view'),
    ThreadView = require('./thread-view'),
    AdminView = require('./admin-view'),
    RegisterView = require('./register-view');

module.exports = class ContentView {
  constructor (templates, Request, appEvents) {
    this.templates = templates;
    this.requests = contentRequestHelper(Request);
    this.router = new ContentRouter();
    this.appEvents = appEvents;

    const events = {
      click  : 'click',
      submit : 'submit'
    },
    namespace = '.content';

    this.events = events;
    this.namespace = namespace;

    this.initialize();
  }

  initialize () {
    this.router.register('index', this.index.bind(this));
    this.router.register('thread', this.thread.bind(this));
    this.router.register('submit', this.submitForm.bind(this));
    this.router.register('register', this.register.bind(this));
    this.router.register('admin', this.admin.bind(this));

    this.el = document.querySelector('.content');
    this.createEventListeners();

    this.router.initialize();
  }

  createEventListeners () {
    this.appEvents.listen('showAdmin', this.namespace, this.admin.bind(this));
    this.appEvents.listen('register', this.namespace, this.register.bind(this));

    this.el.addEventListener(this.events.click,
      this.appEvents.trigger.bind(this.appEvents, this.events.click + this.namespace));
    this.el.addEventListener(this.events.submit,
      this.appEvents.trigger.bind(this.appEvents, this.events.submit + this.namespace));
  }

  index (data, isPageLoad = false) {
    this.destroyView();
    this.view = new IndexView(this, data, isPageLoad);
  }

  submitForm (isPageLoad = false, isFromPopState = false, editId) {
    this.destroyView();
    this.view = new SubmitView(this, isPageLoad, isFromPopState, editId);
  }

  thread (id, data, isPageLoad = false) {
    this.destroyView();
    this.view = new ThreadView(id, this, data, isPageLoad);
  }

  register (isPageLoad = false, isFromPopState = false) {
    this.destroyView();
    this.view = new RegisterView(this, isPageLoad, isFromPopState);
  }

  admin (data, isPageLoad = false) {
    this.destroyView();
    this.view = new AdminView(this, data, isPageLoad);
  }

  destroyView () {
    if (this.view) {
      this.view.unbind();
    }
  }

}
