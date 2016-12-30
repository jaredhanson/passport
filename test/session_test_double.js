/**
 * Allows to:
 *   - set and get properties (like session.user = "john")
 *   - generate new session with new id (like express-session's regenerate)
 *   - clear the current session (without destroying it)
 *   - get the internal state for testing purposes
 *   - simulate id regeneration failure
 *
 * The following example of the internal state (session.data)
 * shows a session that:
 *  1. had id "1"
 *  2. held variable "some_key"
 *  3. was regenerated and got id "2"
 *  4. held variable "another_key"
 * {
 *   1: { some_key: "abc" },
 *   2: { another_key: "123" }
 * }
 *
 */

module.exports = new Proxy({}, {

  regeneration_should_fail: false,
  regeneration_error: "forced error",
  data: {1: {}},
  id: 1,

  regenerate: function (cb) {
    this.id += 1;
    this.data[this.id] = {};
    cb(this.regeneration_should_fail ? this.regeneration_error : undefined);
  },

  clear: function () {
    this.data = {1: {}};
    this.id = 1;
  },

  get empty () {
    return Object.keys(this.data[this.id]).length === 0;
  },

  set: function (target, prop, val) {
    if (typeof this[prop] !== 'undefined') {
      this[prop] = val;
      return;
    }

    this.data[this.id][prop] = val;
  },

  get: function (target, prop) {
    if (typeof this[prop] !== 'undefined') {
      return this[prop];
    }

    return this.data[target.id][prop];
  }

});
