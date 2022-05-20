var merge = require('utils-merge');

function SessionManager(options, serializeUser) {
  if (typeof options == 'function') {
    serializeUser = options;
    options = undefined;
  }
  options = options || {};
  
  this._key = options.key || 'passport';
  this._serializeUser = serializeUser;
}

SessionManager.prototype.logIn = function(req, user, options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = {};
  }
  options = options || {};
  
  if (!req.session) { return cb(new Error('Login sessions require session support. Did you forget to use `express-session` middleware?')); }
  
  var self = this;
  var prevSession = req.session;
  
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
      if (options.keepSessionInfo) {
        merge(req.session, prevSession);
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

SessionManager.prototype.logOut = function(req, options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = {};
  }
  options = options || {};
  
  if (!req.session) { return cb(new Error('Login sessions require session support. Did you forget to use `express-session` middleware?')); }
  
  var self = this;
  
  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged in user
  if (req.session[this._key]) {
    delete req.session[this._key].user;
  }
  var prevSession = req.session;
  
  req.session.save(function(err) {
    if (err) {
      return cb(err)
    }
  
    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(function(err) {
      if (err) {
        return cb(err);
      }
      if (options.keepSessionInfo) {
        merge(req.session, prevSession);
      }
      cb();
    });
  });
}


module.exports = SessionManager;
