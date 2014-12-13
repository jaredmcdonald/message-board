module.exports = class SubmitView {
  constructor (parentView, isPageLoad) {
    this.parentView = parentView;
    this.isPageLoad = isPageLoad;
    this.el = parentView.el;
    this.templates = parentView.templates;
    this.appEvents = parentView.appEvents;
    this.appRegistry = parentView.appRegistry;
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

    this.initialize(isPageLoad);
  }

  initialize () {
    if (!this.appRegistry.get('isLoggedIn')) {
      return this.parentView.index();
    }
    this.bindDomEvents();
    this.router[this.isPageLoad ? 'replaceState' : 'pushState'](true, this.url);
    this.render();
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
    this.requests.create({
      title   : event.target[0].value,
      content : event.target[1].value
    }, this.handleResponse.bind(this));
  }

  handleResponse (data) {
    this.parentView.index();
    this.bindLoginEvent();
  }

  bindDomEvents () {
    this.appEvents.listen(this.events.click, this.namespace, this.clickListener.bind(this));
    this.appEvents.listen(this.events.submit, this.namespace, this.submitListener.bind(this));
  }

  bindLoginEvent () {
    if (!this.loginBound) {
        // listen for logout (a login event with loggedIn: false)
        this.appEvents.listen(this.events.login, this.namespace, this.logoutHandler.bind(this));
        this.loginBound = true;
    }
  }

  unbind () {
    this.appEvents.remove(this.events.submit, this.namespace);
    this.appEvents.remove(this.events.click, this.namespace);
    this.appEvents.remove(this.events.login, this.namespace);
  }

  render () {
    this.el.innerHTML = this.templates.back.render() + this.templates.submit.render();
  }
}
