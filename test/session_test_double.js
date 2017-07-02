/**
 * Session test double factory.
 *
 * Takes a list of names of session variables that are going to be used in the test.
 *
 * The session test double allows to:
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

module.exports = function (names_of_all_session_variables) {

  var data = {1: {}};
  var id = 1;

  //provides access to internal state and methods like regenerate,
  //but doesn't provide setters and getters yet
  var session = {

    regeneration_should_fail: false,
    regeneration_error: "forced error",
    get data() { return data; },
    get id() { return id; },

    regenerate: function (cb) {
      if (this.regeneration_should_fail) {
        cb(this.regeneration_error);
      } else {
        id++;
        data[id] = {};
        cb();
      }
    },

    clear: function () {
      data = {1: {}};
      id = 1;
    },

    get empty() {
      return Object.keys(data[id]).length === 0;
    }

  };

  //generate descriptions of session variables under test
  //in order to provide getters and setters
  var propDescs = {};
  names_of_all_session_variables.forEach(function (var_name) {
    propDescs[var_name] = {

      writtable: true,

      get: function() {
        return data[id][var_name];
      },

      set: function (val) {
        data[id][var_name] = val;
      },

    };
  });

  //assign getters and setters of session variables
  Object.defineProperties(session, propDescs);

  //session test double which supports setters and getters
  return session;
}
