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

    this.initialize();
  }

  initialize () {
    this.router.register('index', this.index.bind(this));
    this.router.register('thread', this.thread.bind(this));

    this.el = document.querySelector('.content');

    this.router.initialize();
  }

  index () {
    this.destroyView();
    this.view = new IndexView(this);
  }

  submitForm () {
    this.destroyView();
    this.view = new SubmitView(this);
  }

  thread (id) {
    this.destroyView();
    this.view = new ThreadView(id, this);
  }

  destroyView () {
    if (this.view) {
      this.view.unbind();
    }
  }

}
