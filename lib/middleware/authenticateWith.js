/**
 * Module dependencies.
 */
var authenticate = require('./authenticate')
  , Strategy = require('passport-strategy')



/**
 * Dynamically configures methods for authenticating requests.
 *
 * Employs the `configurator` to dynamically determine either a Strategy or
 * list of strategy names with which to authenticate the request. This allows
 * the authentication to be undertaken with context of the individual request.
 * If the configurator returns a list of strategy names, those strategies must
 * be preconfigured, as for the standard `authenticate` middleware.
 *
 * See the superior `authenticate` middleware for more information and details.
 *
 * @param {Function} configurator
 * @param {Object} options
 * @param {Function} callback
 * @return {Function}
 * @api public
 */
module.exports = function authenticateWith(passport, configurator, options, callback) {
  if (typeof options == 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  // The default configurator will cause `authenticate` to fail and handle
  // that failure as per how it is set up.
  configurator = configurator || function(req, done) { return done(); }

  return function authenticateWith(req, res, next) {

    function configured(err, method) {
      if (err) { return next(err); }

      // If configuration does not return a Strategy or name(s) of strategies,
      // we will pass up an empty array, which `authenticate` will handle using
      // the preferred failure mode. This provides the least behavioral
      // divergence between this middleware and `authenticate`.
      method = method || [];

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
