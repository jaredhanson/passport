/**
 * Module dependencies.
 */
var initialize = require('../middleware/initialize')
  , authenticate = require('../middleware/authenticate');
  
/**
 * Framework support for Connect/Express.
 *
 * This module provides support for using Passport with Express.  It exposes
 * middleware that conform to the `fn(req, res, next)` signature.
 *
 * @return {Object}
 * @api protected
 */
exports = module.exports = function() {
  
  return {
    initialize: initialize,
    authenticate: authenticate
  };
};
