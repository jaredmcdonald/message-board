module.exports = class SubmitView {
  constructor (parentView) {
    this.parentView = parentView;
    this.el = parentView.el;
    this.templates = parentView.templates;
    this.appEvents = parentView.appEvents;
    this.appRegistry = parentView.appRegistry;
    this.requests = parentView.requests;

    this.initialize();
  }

  initialize () {
    this.createBoundHandlers();
    this.bindEvents();
    this.render();

    // listen for logout (a login event with loggedIn: false)
    this.appEvents.listen('login', this.logoutHandler.bind(this));
  }

  logoutHandler (data) {
    if (!data.loggedIn) {
      this.parentView.index();
    }
  }

  createBoundHandlers () {
    this.bound = {
      submit : this.submitListener.bind(this)
    };
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
    this.el.addEventListener('submit', this.bound.submit);
  }

  unbind () {
    this.el.removeEventListener('submit', this.bound.submit);
  }

  render () {
    this.el.innerHTML = this.templates.submit.render();
  }
}
