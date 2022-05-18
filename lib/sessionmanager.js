function SessionManager(options, serializeUser) {
  if (typeof options == 'function') {
    serializeUser = options;
    options = undefined;
  }
  options = options || {};
  
  this._key = options.key || 'passport';
  this._serializeUser = serializeUser;
}

SessionManager.prototype.logIn = function(req, user, cb) {
  console.log('SM: logIn');
  
  var self = this;
  
  // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  req.session.regenerate(function(err) {
    if (err) {
      return cb(err);
    }
    
    self._serializeUser(user, req, function(err, obj) {
      if (err) {
        return cb(err);
      }
      // TODO: Error if session isn't available here.
      if (!req.session) {
        req.session = {};
      }
      if (!req.session[self._key]) {
        req.session[self._key] = {};
      }
      // store user information in session, typically a user id
      req.session[self._key].user = obj;
      // save the session before redirection to ensure page
      // load does not happen before session is saved
      req.session.save(function(err) {
        if (err) {
          return cb(err);
        }
        cb();
      });
    });
  });
}

SessionManager.prototype.logOut = function(req, cb) {
  console.log('SM: logOut');
  
  var self = this;
  req.session.regenerate(function(err) {
    if (err) {
      return cb(err);
    }
    
    if (req.session && req.session[self._key]) {
      delete req.session[self._key].user;
    }
    cb && cb();
  });
}


module.exports = SessionManager;
