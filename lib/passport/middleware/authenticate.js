var util = require('util');


// TODO: Implement support for authenticting with multiple strategies.
// TODO: Allow a callback to be passed to the set-up function
module.exports = function authenticate(strategy) {
  
  // NOTE: `this` context is bound to an instance of Passport
  return function authenticate(req, res, next) {
    var passport = this;
    var prototype = passport._strategy(strategy);
    
    var instance = Object.create(prototype);
    instance.success = function(user) {
      passport.serializeUser(user, function(err, obj) {
        // TODO: Handle errors.
        req._passport.user = obj;
        req.user = user;
        next();
      });
    }
    instance.error = function(err) {
      next(err);
    }
    instance.unauthorized = function() {
      res.statusCode = 401;
      // TODO: Set the value of the WWW-Authenticate header according to the
      //       strategy in use.
      res.setHeader('WWW-Authenticate', 'Basic realm="' + 'WWW' + '"');
      res.end('Authentication Required');
    }
    instance.redirect = function(url, status) {
      res.statusCode = status || 302;
      res.setHeader('Location', url);
      res.end();
    }
    
    applyStrategy(instance, req, res);
  }
}


function applyStrategy(strategy, req, res) {
  // apply strategy-specific middleware, if any
  var stack = strategy.middleware;
  (function pass(i, err) {
    if (err) { return strategy.error(err); }
      
    var layer = stack[i];
    if (!layer) {
      // middleware done, authenticate request
      return strategy.authenticate(req);
    }
      
    try {
      layer(req, res, function(e) { pass(i + 1, e); } )
    } catch (e) {
      return strategy.error(e);
    }
  })(0);
}
