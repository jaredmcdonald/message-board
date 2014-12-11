module.exports = class SubmitView {
  constructor (parentView) {
    this.parentView = parentView;
    this.el = parentView.el;
    this.templates = parentView.templates;
    this.appEvents = parentView.appEvents;
    this.appRegistry = parentView.appRegistry;
    this.requests = parentView.requests;

    const events = {
      submit : 'submit.content',
      click  : 'click.content',
      login  : 'login'
    },
    namespace = 'SubmitView';

    this.events = events;
    this.namespace = namespace;

    this.initialize();
  }

  initialize () {
    this.bindEvents();
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
      this.parentView.index();
    }
  }

  submitListener (event) {
    event.preventDefault();
    this.requests.create({
      content : event.target[0].value
    }, this.handleResponse.bind(this));
  }

  handleResponse (data) {
    this.parentView.index();
  }

  bindEvents () {
    // listen for logout (a login event with loggedIn: false)
    this.appEvents.listen(this.events.login, this.namespace, this.logoutHandler.bind(this));
    this.appEvents.listen(this.events.click, this.namespace, this.clickListener.bind(this));
    this.appEvents.listen(this.events.submit, this.namespace, this.submitListener.bind(this));
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
