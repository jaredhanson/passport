/**
 * Module dependencies.
 */
var util = require('util')
  , actions = require('../context/http/actions')
  , Context = require('../context/http/context')


/**
 * Authenticates requests.
 *
 * Applies the `name`ed strategy (or strategies) to the incoming request, in
 * order to authenticate the request.  If authentication is successful, the user
 * will be logged in and populated at `req.user` and a session will be
 * established by default.  If authentication fails, an unauthorized response
 * will be sent.
 *
 * Options:
 *   - `session`          Save login state in session, defaults to _true_
 *   - `successRedirect`  After successful login, redirect to given URL
 *   - `failureRedirect`  After failed login, redirect to given URL
 *   - `assignProperty`   Assign the object provided by the verify callback to given property
 *
 * An optional `callback` can be supplied to allow the application to overrride
 * the default manner in which authentication attempts are handled.  The
 * callback has the following signature, where `user` will be set to the
 * authenticated user on a successful authentication attempt, or `false`
 * otherwise.  An optional `info` argument will be passed, containing additional
 * details provided by the strategy's verify callback.
 *
 *     app.get('/protected', function(req, res, next) {
 *       passport.authenticate('local', function(err, user, info) {
 *         if (err) { return next(err) }
 *         if (!user) { return res.redirect('/signin') }
 *         res.redirect('/account');
 *       })(req, res, next);
 *     });
 *
 * Note that if a callback is supplied, it becomes the application's
 * responsibility to log-in the user, establish a session, and otherwise perform
 * the desired operations.
 *
 * Examples:
 *
 *     passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' });
 *
 *     passport.authenticate('basic', { session: false });
 *
 *     passport.authenticate('twitter');
 *
 * @param {String} name
 * @param {Object} options
 * @param {Function} callback
 * @return {Function}
 * @api public
 */
module.exports = function authenticate(name, options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  
  // TODO: Implement support for authenticting with multiple strategies.
  
  return function authenticate(req, res, next) {
    var passport = this;
    var delegate = {};
    passport.strategy = name
    delegate.success = function(user, info) {
      if (callback) {
        return callback(null, user, info);
      }
      if (options.successFlash && info) {
        var option = options.successFlash;
        if (typeof option == 'string') {
          option = { type: 'success', message: option };
        }
        option.type = option.type || 'success';
        
        var type = option.type || info.type || 'success';
        var msg = option.message || info.message || info;
        
        if (typeof msg == 'string') {
          req.flash(type, msg);
        }
      }
      if (options.assignProperty) {
        req[options.assignProperty] = user;
        return next();
      }
      
      req.logIn(user, options, function(err) {
        if (err) { return next(err); }
        if (options.successRedirect) {
          return res.redirect(options.successRedirect);
        }
        next();
      });
    }
    delegate.fail = function(challenge, status) {
      if (callback) {
        return callback(null, false, challenge, status);
      }
      if (options.failureFlash && challenge) {
        var option = options.failureFlash;
        if (typeof option == 'string') {
          option = { type: 'error', message: option };
        }
        option.type = option.type || 'error';
        
        var type = option.type || challenge.type || 'error';
        var msg = option.message || challenge.message || challenge;
        
        if (typeof msg == 'string') {
          req.flash(type, msg);
        }
      }
      if (options.failureRedirect) {
        return res.redirect(options.failureRedirect);
      }
      
      
      if (typeof challenge == 'number') {
        status = challenge;
        challenge = null;
      }
      
      // When failure handling is not delegated to the application, the default
      // is to respond with 401 Unauthorized.  Note that the WWW-Authenticate
      // header will be set according to the strategies in use (see
      // actions#fail).
      res.statusCode = status || 401;
      if (typeof challenge == 'string') {
        this.res.setHeader('WWW-Authenticate', challenge);
      }
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
    
    strategy.authenticate(req, options);
  }
}


function augment(strategy, actions, ctx) {
  for (var method in actions) {
    strategy[method] = actions[method].bind(ctx);
  }
}
