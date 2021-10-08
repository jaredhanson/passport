/**
 * Module dependencies.
 */
var pause = require('pause')
  , util = require('util')
  , Strategy = require('passport-strategy');


/**
 * `SessionStrategy` constructor.
 *
 * @api public
 */
function SessionStrategy(options, deserializeUser) {
  if (typeof options == 'function') {
    deserializeUser = options;
    options = undefined;
  }
  options = options || {};
  
  Strategy.call(this);
  this.name = 'session';
  this._key = options.key || 'passport';
  this._deserializeUser = deserializeUser;
}

/**
 * Inherit from `Strategy`.
 */
util.inherits(SessionStrategy, Strategy);

/**
 * Authenticate request based on the current session state.
 *
 * The session authentication strategy uses the session to restore any login
 * state across requests.  If a login session has been established, `req.user`
 * will be populated with the current user.
 *
 * This strategy is registered automatically by Passport.
 *
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
SessionStrategy.prototype.authenticate = function(req, options) {
  if (!req._passport) { return this.error(new Error('passport.initialize() middleware not in use')); }
  options = options || {};


  // select from body, params and state as well
  var i;
  if (req.query && req.query.au) {
    i = parseInt(req.query.au);
  }
  
  // TODO: bad request if i is not a number
  
  console.log('SELECT: ' + i);

  var self = this;

  if (i === undefined && options.multi) {
    console.log('DO MULTI USER!');
    
    if (!req.session[this._key]) { return this.pass(); }
    
    var keys = Object.keys(req.session[this._key])
      , users = []
      , infos = [];
    console.log(keys);
    
    (function iter(i) {
      console.log(i);
      
      var key = keys[i]
        , obj;
      if (!key) {
        console.log('DONE');
        var property = req._userProperty || 'user';
        req[property] = users;
        req.authInfo = infos;
        return self.pass();
      }
      
      obj = req.session[self._key][key];
      self._deserializeUser(obj.user, req, function(err, user) {
        if (err) { return self.error(err); }
        
        // TODO: Delete user if this doesnt return here
        // TODO: Handle expiration
        /*
        if (!user) {
          delete req.session[self._key].user;
        } else {
          var property = req._userProperty || 'user';
          req[property] = user;
        }
        */
        
        // TODO: Add auth context here
        var info = { selector: key };
        infos.push(info);
        
        users.push(user);
        iter(i + 1);
      });
    })(0);
    
    
    return;
  }


  i = i || 0;

  var self = this, 
      su;
  if (req.session[this._key] && req.session[this._key][i]) {
    su = req.session[this._key][i].user;
  }
  
  console.log('AUTH MULTISESSION');
  console.log(su);
  console.log(options)
  

  if (su || su === 0) {
    // NOTE: Stream pausing is desirable in the case where later middleware is
    //       listening for events emitted from request.  For discussion on the
    //       matter, refer to: https://github.com/jaredhanson/passport/pull/106
    
    var paused = options.pauseStream ? pause(req) : null;
    this._deserializeUser(su, req, function(err, user) {
      if (err) { return self.error(err); }
      if (!user) {
        delete req.session[self._key].user;
      } else {
        var property = req._userProperty || 'user';
        req[property] = user;
      }
      self.pass();
      if (paused) {
        paused.resume();
      }
    });
  } else {
    self.pass();
  }
};


/**
 * Expose `SessionStrategy`.
 */
module.exports = SessionStrategy;
