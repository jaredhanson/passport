/**
 * Module dependencies.
 */
var http = require('http')
  , req = http.IncomingMessage.prototype;


req.authenticate = function() {
  // TODO: Implement this function (by calling this._passport.instance.authenticate)
}

req.logout = function() {
  // TODO: Implement this function
};

/**
 * Test if request is authenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isAuthenticated = function() {
  if (!this._passport) throw new Error('passport.authentication() middleware not in use');
  return (this._passport.session && this._passport.session.user) ? true : false;
};

/**
 * Test if request is unauthenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isUnauthenticated = function() {
  return !this.isAuthenticated();
};
