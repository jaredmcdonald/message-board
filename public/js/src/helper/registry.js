/*
 *  Module for shared application status items,
 *  e.g., checking if a user is logged in from
 *  a ThreadView
 *
 **/

module.exports = class StaticRegistry {
  constructor () {
    this.registered = {};
  }

  // Register a shared function as `name`
  register (name, fn) {
    this.registered[name] = fn;
  }

  // Call the shared function at `name`
  get (name) {
    return this.registered[name]();
  }
}
