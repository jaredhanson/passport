/**
 * Module dependencies.
 */
var http = require('http')
  , req = http.IncomingMessage.prototype;


req.isAuthenticated = function() {
  return (this._passport.user) ? true : false;
};
