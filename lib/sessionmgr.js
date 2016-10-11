function SessionManager() {
  this.legacy = true;
}

SessionManager.prototype.logIn = function(req, user, cb) {
  req._passport.instance.serializeUser(user, req, function(err, obj) {
    if (err) { return cb(err); }
    if (!req._passport.session) {
      req._passport.session = {};
    }
    req._passport.session.user = obj;
    if (!req.session) {
      req.session = {};
    }
    req.session[req._passport.instance._key] = req._passport.session;
    cb();
  });
}

SessionManager.prototype.logOut = function(req, cb) {
  if (req._passport && req._passport.session) {
    delete req._passport.session.user;
  }
  cb && cb();
}


module.exports = SessionManager;
