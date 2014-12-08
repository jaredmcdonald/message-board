let UserDetailsModel = require('../model/user-details-model'),
    loginRequestHelper = require('../helper/login-request-helper');

module.exports = class UserDetailsView {

  constructor (templates, Request, registry) {
    this.model = new UserDetailsModel();
    this.requests = loginRequestHelper(Request);
    this.templates = templates;
    this.registry = registry;
    this.initialize();
  }

  initialize () {
    this.el = document.querySelector('.user-details');
    this.requests.checkLogin(this.handleResponse.bind(this));
    this.setEvents();

    let self = this;

    this.registry.register('isLoggedIn', function () {
      return self.model.loggedIn;
    })

    return this;
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
    this.el.innerHTML = this.templates.login.render(this.model.getData());
  }

}
