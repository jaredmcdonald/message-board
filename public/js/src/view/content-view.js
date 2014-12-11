let contentRequestHelper = require('../helper/content-request-helper'),
    ContentRouter = require('../helper/content-router'),
    SubmitView = require('./submit-view'),
    IndexView = require('./index-view'),
    ThreadView = require('./thread-view');

module.exports = class ContentView {
  constructor (templates, Request, appRegistry, appEvents) {
    this.templates = templates;
    this.requests = contentRequestHelper(Request);
    this.router = new ContentRouter();
    this.appRegistry = appRegistry;
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

    this.el = document.querySelector('.content');
    this.createEventListeners();

    this.router.initialize();
  }

  createEventListeners () {
    this.el.addEventListener(this.events.click,
      this.appEvents.trigger.bind(this.appEvents, this.events.click + this.namespace));
    this.el.addEventListener(this.events.submit,
      this.appEvents.trigger.bind(this.appEvents, this.events.submit + this.namespace));
  }

  index () {
    this.destroyView();
    this.router.pushState({}, '#/');
    this.view = new IndexView(this);
  }

  submitForm () {
    this.destroyView();
    this.router.pushState({}, '#/submit/');
    this.view = new SubmitView(this);
  }

  thread (id) {
    this.destroyView();
    this.router.pushState({}, `#/comment/${id}`);
    this.view = new ThreadView(id, this);
  }

  destroyView () {
    if (this.view) {
      this.view.unbind();
    }
  }

}
