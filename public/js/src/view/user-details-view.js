let UserDetailsModel = require('../model/user-details-model'),
    loginRequestHelper = require('../helper/login-request-helper');

module.exports = class UserDetailsView {

  constructor (template, Request, appRegistry, appEvents) {
    this.model = new UserDetailsModel(appRegistry, appEvents);
    this.requests = loginRequestHelper(Request);
    this.template = template;
    this.appEvents = appEvents;
    this.appRegistry = appRegistry;
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
    let self = this;

    // logout
    this.el.addEventListener('click', function (event) {
      if (/logout/.test(event.target.className)) {
        event.preventDefault();
        self.logout();
      }
    });

    // login
    this.el.addEventListener('submit', function (event) {
      event.preventDefault();
      self.login({
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
