let UserDetailsView = require('./user-details-view'),
    ContentView = require('./content-view'),
    Request = require('../request'),
    EventRegistry = require('../helper/events.js'),
    StaticRegistry = require('../helper/registry.js'),
    templates = require('../../../templates/dist/templates');

module.exports = class AppView {

  constructor () {
    this.events = new EventRegistry();
    this.registry = new StaticRegistry();
  }

  initialize () {
    this.userDetailsView = new UserDetailsView(templates.login, Request, this.registry, this.events);
    this.contentView = new ContentView(templates, Request, this.registry, this.events);

    return this;
  }
}
