let ThreadModel = require('../model/thread-model');

module.exports = class ThreadView {
  constructor (id, parentView) {
    this.id = id;
    this.el = parentView.el;
    this.templates = parentView.templates;
    this.requests = parentView.requests;
    this.appRegistry = parentView.appRegistry;
    this.appEvents = parentView.appEvents;
    this.model = new ThreadModel(this.id);
    this.initialize();
  }

  initialize () {
    this.createBoundHandlers();
    this.bindEvents();
    this.requests.thread(this.id, this.handleResponse.bind(this));

    this.appEvents.listen('login', this.loginHandler.bind(this));
  }

  loginHandler (data) {
    this.render(data.loggedIn);
  }

  handleResponse (response) {
    this.model.setData(response);
    this.render();
  }

  createBoundHandlers () {
    this.bound = {
      click: this.clickListener.bind(this),
      submit: this.submitListener.bind(this)
    }
  }

  bindEvents () {
    this.el.addEventListener('click', this.bound.click);
    this.el.addEventListener('submit', this.bound.submit);
  }

  unbind () {
    this.el.removeEventListener('click', this.bound.click);
    this.el.addEventListener('submit', this.bound.submit);
  }

  clickListener (event) {
    if (/reply-link/.test(event.target.className)) {
      event.preventDefault();
      this.appendReplyForm(event.target);
    }
  }

  submitListener (event) {
    event.preventDefault();

    this.requests.create({
      content: event.target[0].value,
      parentId: event.target.previousSibling.dataset.id
    }, this.createReplyCallback.bind(this));
  }

  createReplyCallback (response) {
    this.model.insert(response.data);
    this.render();
  }

  render (isLoggedIn) {
    isLoggedIn = typeof isLoggedIn === 'boolean' ? isLoggedIn : this.appRegistry.get('isLoggedIn');
    this.el.innerHTML = this.generateThreadHTML.bind(this)(this.model.getData(), isLoggedIn)
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

  appendReplyForm (element) {
    element.parentElement.innerHTML = element.parentElement.innerHTML + this.templates.submit.render();
  }

}
