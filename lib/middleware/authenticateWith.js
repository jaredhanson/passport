/**
 * Module dependencies.
 */
var authenticate = require('./authenticate')
  , Strategy = require('passport-strategy')


module.exports = function authenticateWith(passport, configurator, options, callback) {
  if (typeof options == 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  if (!configurator) { throw new TypeError('passport.authenticateWith middleware requires a configuration function'); }

  return function authenticateWith(req, res, next) {

    function configured(err, method) {
      if (err) { return next(err); }
      if (!method) {
        return next(new Error('Dynamic configuration did not return a valid passport strategy'));
      }

      return authenticate(passport, method, options, callback)(req, res, next);
    }

    try {
      var arity = configurator.length;
      if (arity == 3) {
        configurator(req, options, configured);
      } else { // arity == 2
        configurator(req, configured);
      }
    } catch (ex) {
      return next(ex);
    }
  };
};
