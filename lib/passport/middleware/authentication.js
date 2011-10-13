var util = require('util');


module.exports = function authentication() {
  
  // TODO: Move this to a bootstrap middleware, do it lazily on first call into passport stuff
  return function authentication(req, res, next) {
    var passport = this;
    
    // TODO: Allow a key to be set, determining where Passport stores session
    //       information.
    
    if (req.session && req.session.passport) {
      // load existing data from session
      req._passport = req.session.passport;
    } else if (req.session) {
      // add initial data to session
      req.session.passport = {};
      req._passport = req.session.passport;
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
