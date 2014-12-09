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

  // Register an event handler for `name`
  listen (name, fn) {
    this.registered[name] = this.registered[name] || [];
    this.registered[name].push(fn);
  }

  // Call all event handlers for `name`, passing `data`
  trigger (name, data) {
    if (!this.registered[name] || !this.registered[name].length) return false;

    this.registered[name].forEach((handler) => {
      if (typeof handler === 'function') handler(data);
    });
  }

  // TODO provide some mechanism for unbinding
}
