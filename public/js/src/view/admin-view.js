let AdminModel = require('../model/admin-model')
,   requestHelper = require('../helper/admin-request-helper')();

module.exports = class AdminView {
  constructor (parentView, data, isPageLoad) {
    this.parentView = parentView;
    this.appEvents = parentView.appEvents;
    this.router = parentView.router;
    this.el = parentView.el;
    this.requests = requestHelper;
    this.template = parentView.templates.admin;
    this.model = new AdminModel();
    this.isPageLoad = isPageLoad;

    this.fromPopState = false;
    if (data) {
      this.fromPopState = true;
      this.model.setData(data);
    }

    const events = {
      submit : 'submit.content',
      click  : 'click.content',
      login  : 'login'
    },
      namespace = 'AdminView',
      url = '#/admin';

    this.events = events;
    this.namespace = namespace;
    this.url = url;

    this.initialize();
  }

  initialize () {
    this.bindEvents();

    if (!this.fromPopState) {
      this.requests.getUsers(this.handleResponse.bind(this));
    } else {
      this.render();
    }
  }

  handleResponse (data) {
    if (data.error) return this.parentView.index();
    this.model.setData(data);
    this.render();
  }

  bindEvents () {
    this.appEvents.listen(this.events.login, this.namespace, this.loginListener.bind(this));
    this.appEvents.listen(this.events.click, this.namespace, this.clickListener.bind(this));
    this.appEvents.listen(this.events.submit, this.namespace, this.submitListener.bind(this));
  }

  submitListener (event) {
    if (/modify-user/.test(event.target.className)) {
      event.preventDefault();
      let data = {
        username : event.target[0].value,
        bio : event.target[2].value,
        admin : !!event.target[3].checked
      };
      if (event.target[1].value) {
        data.password = event.target[1].value;
      }
      this.modifyUser(event.target.dataset.id, data);
    } else if (/create-user/.test(event.target.className)) {
      event.preventDefault();
      this.newUser({
        username : event.target[0].value,
        password : event.target[1].value,
        bio : event.target[2].value,
        admin : !!event.target[3].checked
      });
    }
  }

  clickListener (event) {
    if (/delete-user/.test(event.target.className)) {
      event.preventDefault();
      this.deleteUser(event.target.dataset.id);
    }
  }

  loginListener (data) {
    if (!data.admin) {
      this.parentView.index();
    }
  }

  modifyUser (id, data) {
    this.requests.patchUser(id, data, this.handleModifyUserResponse.bind(this));
  }

  handleModifyUserResponse (response) {
    this.model.updateUser(response.data);
    this.render();
  }

  newUser (data) {
    this.requests.newUser(data, this.handleNewUserResponse.bind(this));
  }

  handleNewUserResponse (response) {
    this.model.addUser(response.data);
    this.render();
  }

  deleteUser (id) {
    this.requests.deleteUser(id, this.handleDeleteUserResponse.bind(this, id))
  }

  handleDeleteUserResponse (id) {
    this.model.deleteUser(id);
    this.render();
  }

  unbind () {
    this.appEvents.remove(this.events.login, this.namespace);
    this.appEvents.remove(this.events.click, this.namespace);
    this.appEvents.remove(this.events.submit, this.namespace);
  }

  render () {
    this.el.innerHTML = this.template.render({ users : this.model.getData().data });
  }
}
