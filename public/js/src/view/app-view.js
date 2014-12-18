let UserDetailsView = require('./user-details-view'),
    ContentView = require('./content-view'),
    Request = require('../request'),
    EventRegistry = require('../helper/events.js'),
    templates = require('../../../templates/dist/templates');

module.exports = class AppView {

  constructor () {
    this.events = new EventRegistry();
  }

  initialize () {
    this.userDetailsView = new UserDetailsView(templates.login, Request, this.events);
    this.contentView = new ContentView(templates, Request, this.events);

    return this;
  }
}
