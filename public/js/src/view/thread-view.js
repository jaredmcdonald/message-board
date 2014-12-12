let ThreadModel = require('../model/thread-model');

module.exports = class ThreadView {
  constructor (id, parentView, data, isPageLoad) {
    this.id = id;
    this.parentView = parentView;
    this.isPageLoad = isPageLoad;
    this.el = parentView.el;
    this.templates = parentView.templates;
    this.requests = parentView.requests;
    this.appRegistry = parentView.appRegistry;
    this.appEvents = parentView.appEvents;
    this.router = parentView.router;
    this.model = new ThreadModel(this.id);

    const events = {
      submit : 'submit.content',
      click  : 'click.content',
      login  : 'login'
    },
    namespace = 'ThreadView',
    url = `#/comment/${this.id}`;

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
      this.requests.thread(this.id, this.handleResponse.bind(this));
    } else {
      this.render();
    }
  }

  loginHandler (data) {
    this.render(data.loggedIn);
  }

  handleResponse (response) {
    this.model.setData(response);
    this.router[this.isPageLoad ? 'replaceState' : 'pushState'](this.model.getData(), this.url);
    this.render();
  }

  bindEvents () {
    this.appEvents.listen(this.events.click, this.namespace, this.clickListener.bind(this));
    this.appEvents.listen(this.events.submit, this.namespace, this.submitListener.bind(this));
    this.appEvents.listen(this.events.login, this.namespace, this.loginHandler.bind(this));
  }

  unbind () {
    this.appEvents.remove(this.events.click, this.namespace);
    this.appEvents.remove(this.events.submit, this.namespace);
    this.appEvents.remove(this.events.login, this.namespace);
  }

  clickListener (event) {
    if (/reply-link/.test(event.target.className)) {
      event.preventDefault();
      this.appendReplyForm(event.target.parentElement.parentElement, event.target.dataset.id);
    } else if (/back-link/.test(event.target.className)) {
      event.preventDefault();
      this.router.back();
    }
  }

  submitListener (event) {
    event.preventDefault();

    this.requests.create({
      title    : event.target[0].value,
      content  : event.target[1].value,
      parentId : event.target.dataset.id
    }, this.createReplyCallback.bind(this));
  }

  createReplyCallback (response) {
    this.model.insert(response.data);
    this.render();
  }

  render (isLoggedIn) {
    isLoggedIn = typeof isLoggedIn === 'boolean' ? isLoggedIn : this.appRegistry.get('isLoggedIn');
    let back = this.templates.back.render();
    this.el.innerHTML = back + this.generateThreadHTML.bind(this)(this.model.getData(), isLoggedIn)
  }

  generateThreadHTML (item, isLoggedIn) {
    if (!item.children) {
      return this.templates.thread.render({ item, isLoggedIn });
    }

    return this.templates.thread.render({
      item,
      isLoggedIn,
      nested : item.children.reduce((str, current) => str + this.generateThreadHTML(current, isLoggedIn), '')
    });
  }

  appendReplyForm (element, replyTo) {
    element.innerHTML += this.templates.submit.render({ replyTo });
  }

}
