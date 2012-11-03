/**
 * Module dependencies.
 */
var util = require('util')
  , Strategy = require('../strategy');


/**
 * `SessionStrategy` constructor.
 *
 * @api protected
 */
function SessionStrategy() {
  Strategy.call(this);
  this.name = 'session';
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
 * @api protected
 */
SessionStrategy.prototype.authenticate = function(req) {
  if (!req._passport) { return this.error(new Error('passport.initialize() middleware not in use')); }
  
  var self = this
    , su = req._passport.session.user;
  if (su || su === 0) {
    req._passport.instance.deserializeUser(su, function(err, user) {
      if (err) { return self.error(err); }
      if (!user) {
        delete req._passport.session.user;
        return self.pass();
      };
      var property = req._passport.instance._userProperty || 'user';
      req[property] = user;
      self.pass();
    });
  } else {
    self.pass();
  }
}


/**
 * Expose `SessionStrategy`.
 */ 
module.exports = SessionStrategy;
