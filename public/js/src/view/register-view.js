let requestHelper = require('../helper/admin-request-helper')();

module.exports = class RegisterView {
  constructor (parentView, isPageLoad = false, isFromPopState = false) {
    this.parentView = parentView;
    this.appEvents = parentView.appEvents;
    this.router = parentView.router;
    this.templates = parentView.templates;
    this.el = parentView.el;
    this.request = requestHelper.newUser;
    this.isPageLoad = isPageLoad;
    this.isFromPopState = isFromPopState;

    const events = {
      submit : 'submit.content',
      click  : 'click.content',
      login  : 'login',
    },
    namespace = 'RegisterView',
    url = '#/register';

    this.events = events;
    this.namespace = namespace;
    this.url = url;

    this.initialize();
  }

  initialize () {
    this.bindEvents();

    if (this.isPageLoad) {
      this.router.replaceState(true, this.url);
    } else if (!this.isFromPopState) {
      this.router.pushState(true, this.url);
    } // else: the view is already in history so do nothing

    this.render();
  }

  bindEvents () {
    this.appEvents.listen(this.events.login, this.namespace, this.redirect.bind(this));
    this.appEvents.listen(this.events.click, this.namespace, this.clickHandler.bind(this));
    this.appEvents.listen(this.events.submit, this.namespace, this.submitHandler.bind(this));
  }

  clickHandler (event) {
    if (/back-link/.test(event.target.className)) {
      event.preventDefault();
      this.router.back();
    }
  }

  redirect () {
    this.parentView.index();
  }

  submitHandler (event) {
    event.preventDefault();
    this.request({
      username: event.target[0].value,
      password: event.target[1].value,
      bio: event.target[2].value
    }, this.redirect.bind(this));
  }

  unbind () {
    this.appEvents.remove(this.events.login, this.namespace);
    this.appEvents.remove(this.events.click, this.namespace);
    this.appEvents.remove(this.events.submit, this.namespace);
  }

  render () {
    this.el.innerHTML = this.templates.back.render() + this.templates.register.render();
  }
}
