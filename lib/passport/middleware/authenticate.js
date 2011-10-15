var util = require('util')
  , actions = require('../context/http/actions')
  , Context = require('../context/http/context')


// TODO: Implement support for authenticting with multiple strategies.
module.exports = function authenticate(name, options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  
  return function authenticate(req, res, next) {
    var passport = this;
    var delegate = {};
    delegate.success = function(user, extra) {
      if (callback) {
        return callback(null, user, extra);
      }
      
      req.logIn(user, options, function(err) {
        if (err) { return next(err); }
        // TODO: Add an option to automatically redirect on success.
        next();
      });
    }
    delegate.fail = function() {
      if (callback) {
        return callback(null, false);
      } else if (options.failureRedirect) {
        return res.redirect(options.failureRedirect)
      }
      // When failure handling is not delegated to the application, the default
      // is to respond with 401 Unauthorized.  Note that the WWW-Authenticate
      // header will be set according to the strategies in use (see
      // actions#fail).
      res.statusCode = 401;
      res.end('Unauthorized');
    }
    
    // Get the strategy, which will be used as prototype from which to create
    // a new instance.  Action functions will then be bound to the strategy
    // within the context of the HTTP request/response pair.
    var prototype = passport._strategy(name);
    if (!prototype) { return next(new Error('no strategy registered under name: ' + name)); }
    
    var strategy = Object.create(prototype);
    var context = new Context(delegate, req, res, next);
    augment(strategy, actions, context);
    
    strategy.authenticate(req);
  }
}


function augment(strategy, actions, ctx) {
  for (var method in actions) {
    strategy[method] = actions[method].bind(ctx);
  }
}
