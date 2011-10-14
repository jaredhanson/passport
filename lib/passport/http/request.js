/**
 * Module dependencies.
 */
var http = require('http')
  , req = http.IncomingMessage.prototype;


/**
 * Test if request is authenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isAuthenticated = function() {
  return (this._passport && this._passport.user) ? true : false;
};
