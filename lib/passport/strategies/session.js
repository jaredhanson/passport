/**
 * Module dependencies.
 */
var util = require('util')
  , Strategy = require('../strategy');


/**
 * `SessionStrategy` constructor.
 *
 * @api public
 */
function SessionStrategy() {
  Strategy.call(this);
  this.name = 'session';
}

/**
 * Inherit from `Strategy`.
 */
util.inherits(SessionStrategy, Strategy);

SessionStrategy.prototype.authenticate = function(req) {
  var self = this;
  if (req._passport.session.user) {
    req._passport.instance.deserializeUser(req._passport.session.user, function(err, user) {
      if (err) { return self.error(err); }
      req.user = user;
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
