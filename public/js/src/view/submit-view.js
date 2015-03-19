module.exports = class SubmitView {
  constructor (parentView, isPageLoad = false, isFromPopState = false, editId) {
    this.parentView = parentView;
    this.isPageLoad = isPageLoad;
    this.isFromPopState = isFromPopState;
    this.editId = editId;
    this.el = parentView.el;
    this.templates = parentView.templates;
    this.appEvents = parentView.appEvents;
    this.requests = parentView.requests;
    this.router = parentView.router;

    const events = {
      submit : 'submit.content',
      click  : 'click.content',
      login  : 'login'
    },
    namespace = 'SubmitView',
    url = '#/submit';

    this.events = events;
    this.namespace = namespace;
    this.url = url;

    this.isPageLoad = isPageLoad;
    this.initialize();
  }

  initialize () {
    this.bindEvents();

    if (this.editId) {
      this.requests.getItem(this.editId, this.render.bind(this));
    } else {
      if (this.isPageLoad) {
        this.router.replaceState(true, this.url);
      } else if (!this.isFromPopState) {
        this.router.pushState(true, this.url);
      } // else: the view is already in history so do nothing

      this.render();
    }
  }

  logoutHandler (data) {
    if (!data.loggedIn) {
      this.parentView.index();
    }
  }

  clickListener (event) {
    if (/back-link/.test(event.target.className)) {
      event.preventDefault();
      this.router.back();
    }
  }

  submitListener (event) {
    event.preventDefault();
    let title = event.target[0].value.trim()
    ,   content = event.target[1].value.trim();

    if (!this.editId && (!title || !content)) return false; // todo: error messaging
    if (this.editId && !content) return false;

    let data = { title, content };

    if (this.editId) {
      // this is an edit to an existing item
      this.requests.edit(this.editId, data, this.handleEditResponse.bind(this));
    } else {
      this.requests.create(data, this.handleResponse.bind(this));
    }

  }

  handleEditResponse (response) {
    if (response.data.path === '') {
      this.parentView.thread(response.data._id);
    } else {
      this.parentView.thread(response.data.path.split(',')[1]);
    }
  }

  handleResponse (data) {
    this.parentView.index();
  }

  bindEvents () {
    this.appEvents.listen(this.events.login, this.namespace, this.logoutHandler.bind(this));
    this.appEvents.listen(this.events.click, this.namespace, this.clickListener.bind(this));
    this.appEvents.listen(this.events.submit, this.namespace, this.submitListener.bind(this));
  }

  unbind () {
    this.appEvents.remove(this.events.submit, this.namespace);
    this.appEvents.remove(this.events.click, this.namespace);
    this.appEvents.remove(this.events.login, this.namespace);
  }

  render (response = { data : {} }) {
    this.el.innerHTML = this.templates.back.render() + this.templates.submit.render({
      content : response.data.content,
      title : response.data.title,
      isReply : !!response.data.path
    });
  }
}
