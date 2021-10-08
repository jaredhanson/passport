function MultiSessionManager(options, serializeUser) {
  if (typeof options == 'function') {
    serializeUser = options;
    options = undefined;
  }
  options = options || {};
  
  this._key = options.key || 'passport';
  this._serializeUser = serializeUser;
}

MultiSessionManager.prototype.logIn = function(req, user, cb) {
  console.log('MULTI SESSION MANAGER LOGIN');
  
  var self = this;
  this._serializeUser(user, req, function(err, obj) {
    if (err) {
      return cb(err);
    }
    // TODO: Error if session isn't available here.
    if (!req.session) {
      req.session = {};
    }
    if (!req.session[self._key]) {
      req.session[self._key] = { ni: 0 };
    }
    
    var i = req.session[self._key].ni;
    
    req.session[self._key][i] = { user: obj };
    
    req.session[self._key].ni = i + 1;
    
    console.log('SESSION IS NOW');
    console.log(req.session);
    console.log(req.session[self._key])
    
    cb();
  });
}

MultiSessionManager.prototype.logOut = function(req, cb) {
  if (req.session && req.session[this._key]) {
    delete req.session[this._key].user;
  }
  
  cb && cb();
}


module.exports = MultiSessionManager;
