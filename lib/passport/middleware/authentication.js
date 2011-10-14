/**
 * Module dependencies.
 */
var util = require('util');


module.exports = function authentication() {
  
  return function authentication(req, res, next) {
    var passport = this;
    
    if (req.session && req.session[passport._key]) {
      // load existing data from session
      req._passport = req.session[passport._key];
    } else if (req.session) {
      // add initial data to session
      req.session[passport._key] = {};
      req._passport = req.session[passport._key];
    } else {
      // no session is available
      req._passport = {};
    }
    
    if (req._passport.user) {
      passport.deserializeUser(req._passport.user, function(err, user) {
        if (err) { return next(err); }
        req.user = user;
        next();
      });
    } else {
      next();
    }
  }
}
