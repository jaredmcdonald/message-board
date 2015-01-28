let UserDetailsModel = require('../model/user-details-model'),
    loginRequestHelper = require('../helper/login-request-helper');

module.exports = class UserDetailsView {

  constructor (template, Request, appEvents) {
    this.model = new UserDetailsModel(appEvents);
    this.requests = loginRequestHelper(Request);
    this.template = template;
    this.appEvents = appEvents;
    this.initialize();
  }

  initialize () {
    this.el = document.querySelector('.user-details');
    this.requests.checkLogin(this.handleResponse.bind(this));
    this.setEvents();
  }

  handleResponse (data) {
    this.model.setData(data);
    this.render();
  }

  setEvents () {
    // logout
    this.el.addEventListener('click', event => {
      if (/logout/.test(event.target.className)) {
        event.preventDefault();
        this.logout();
      } else if (/register/.test(event.target.className)) {
        event.preventDefault();
        this.appEvents.trigger('register');
      } else if (/admin/.test(event.target.className)) {
        event.preventDefault();
        this.appEvents.trigger('showAdmin');
      }
    });

    // login
    this.el.addEventListener('submit', event => {
      event.preventDefault();
      this.login({
        username : event.target[0].value,
        password : event.target[1].value
      });
    });
  }

  login (data) {
    this.requests.login(data, this.handleResponse.bind(this));
  }

  logout () {
    this.requests.logout(this.handleResponse.bind(this, {
      data: {
        // 204 No Content, so provide data to callback
        loggedIn : false,
        authFailed: false
      }
    }));
  }

  render () {
    this.el.innerHTML = this.template.render(this.model.getData());
  }

}
