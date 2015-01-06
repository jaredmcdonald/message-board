let ThreadModel = require('../model/thread-model'),
    marked = require('marked');

marked.setOptions({
  sanitize: true
});

module.exports = class ThreadView {
  constructor (id, parentView, data, isPageLoad) {
    this.id = id;
    this.parentView = parentView;
    this.isPageLoad = isPageLoad;
    this.el = parentView.el;
    this.templates = parentView.templates;
    this.requests = parentView.requests;
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
      this.model.setData(data);
    }

    this.initialize();
  }

  initialize () {
    this.bindDomEvents();

    if (!this.fromPopState) {
      this.requests.thread(this.id, this.handleResponse.bind(this));
    } else {
      this.render();
    }
  }

  loginHandler (data) {
    this.model.setLoggedIn(data.loggedIn);
    this.render();
  }

  handleResponse (response) {
    this.model.setData(response);
    this.router[this.isPageLoad ? 'replaceState' : 'pushState'](this.model.getData(), this.url);
    this.render();
    this.bindLoginEvent();
  }

  bindDomEvents () {
    this.appEvents.listen(this.events.click, this.namespace, this.clickListener.bind(this));
    this.appEvents.listen(this.events.submit, this.namespace, this.submitListener.bind(this));
  }

  bindLoginEvent () {
    if (!this.loginBound) {
      this.appEvents.listen(this.events.login, this.namespace, this.loginHandler.bind(this));
      this.loginBound = true;
    }
  }

  unbind () {
    this.appEvents.remove(this.events.click, this.namespace);
    this.appEvents.remove(this.events.submit, this.namespace);
    this.appEvents.remove(this.events.login, this.namespace);
  }

  clickListener (event) {
    if (/reply-link/.test(event.target.className)) {
      event.preventDefault();
      this.appendReplyForm(event.target, event.target.parentElement.parentElement, event.target.dataset.id);
    } else if (/back-link/.test(event.target.className)) {
      event.preventDefault();
      this.router.back();
    } else if (/vote-link/.test(event.target.className)) {
      event.preventDefault();
      this.vote(event.target.dataset);
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

  vote (data) {
    this.requests.vote(data.id, data.vote, this.handleVoteResponse.bind(this));
  }

  handleVoteResponse (response) {
    this.model.updateItem(response.data);
    this.router.replaceState(this.model.getData(), this.url);
    this.render();
  }

  createReplyCallback (response) {
    this.model.insert(response.data);
    this.router.replaceState(this.model.getData(), this.url);
    this.render();
  }

  render () {
    let data = this.model.getData();
    this.el.innerHTML = this.templates.back.render() + this.generateThreadHTML.bind(this)(data.data, data.loggedIn)
  }

  generateThreadHTML (item, isLoggedIn) {
    // we don't want to mutate the model, so create a local copy
    // which we can mutate (namely, converting `content` to markdown)
    let clone = Object.create(item);
    clone.content = marked(clone.content);
    if (!clone.children) {
      return this.templates.thread.render({ item : clone, isLoggedIn }, { votePartial : this.templates.votePartial });
    }

    return this.templates.thread.render({
      item : clone,
      isLoggedIn,
      nested : clone.children.reduce((str, current) => str + this.generateThreadHTML(current, isLoggedIn), '')
    }, { votePartial : this.templates.votePartial });
  }

  appendReplyForm (linkElement, element, replyTo) {
    linkElement.outerHTML = '';
    element.innerHTML += this.templates.submit.render({ replyTo });
  }

}
