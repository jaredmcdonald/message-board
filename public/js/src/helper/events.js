/*
 *  Module for shared application events,
 *  e.g., a user logs in and the ThreadView
 *  subscribes to it
 *
 **/

module.exports = class EventRegistry {
  constructor () {
    this.registered = {};
  }

  // Register an event handler for `name` as `namespace`
  listen (name, namespace, handler) {
    this.registered[name] = this.registered[name] || [];
    this.registered[name].push({ handler, namespace });
  }

  // Call all event handlers for `name`, passing `data`
  trigger (name, data) {
    if (!this.registered[name] || !this.registered[name].length) return false;

    this.registered[name].forEach((obj) => typeof obj.handler === 'function' && obj.handler(data));
  }

  // Remove the event handler `namespace` for event `name`
  remove (name, namespace) {
    if (!this.registered[name]) return false;

    let index = this.registered[name].findIndex((obj) => obj.namespace === namespace);
    if (index > 0) return false;

    this.registered[name].splice(index, 1);
  }
}
