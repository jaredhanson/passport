/**
 * Module dependencies.
 */
var initialize = require('../middleware/initialize')
  , authenticate = require('../middleware/authenticate');
  
/**
 * Framework support for Connect/Express.
 *
 * This module provides support for using Passport with Express.  It exposes
 * middleware that conform to the `fn(req, res, next)` signature and extends
 * Node's built-in HTTP request object with useful authentication-related
 * functions.
 *
 * @return {Object}
 * @api protected
 */
module.exports = function() {
  
  // HTTP extensions.
  require('../http/request');
  
  return {
    initialize: initialize,
    authenticate: authenticate
  };
};
