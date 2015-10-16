/**
 * Module dependencies.
 */
var http = require('http')
  , AuthenticationError = require('../errors/authenticationerror');


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
 *     app.get('/protected',
 *       passport.authenticate('local', 
 *         function(err, user, info, status, req, res, next) {
 *           if (err) { return next(err) }
 *           if (!user) { return res.redirect('/signin') }
 *           res.redirect('/account');
 *         }
 *       )
 *     );
 *
 * Note that if a callback is supplied, all other passport response handling
 * is bypassed, and all options are ignored. This feature should be reserved
 * for performance-critical applications where the base passport options are
 * undesireable.
 *
 * Examples:
 *
 *     passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' });
 *
 *     passport.authenticate('basic', { session: false });
 *
 *     passport.authenticate('twitter');
 *
 * @param {String|Array} name
 * @param {Object} options
 * @param {Function} callback
 * @return {Function}
 * @api public
 */
module.exports = function authenticate(passport, name, options, callback) {
  if (typeof options == 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  function failed(challenges, statuses, req, res, next) {
    // Strategies are ordered by priority.  For the purpose of flashing a
    // message, the first failure will be displayed.
    var msg;
    var failures = 1;
    var challenge = challenges;
    var status = statuses;
    if (Array.isArray(challenges)) {
      failures = challenge.length;
      challenge = challenges[0];
      status = statuses[0];
    } else if (!challenge) {
      challenge = {};
    }
  
    if (options.failureFlash) {
      var flash = options.failureFlash;
      if (typeof flash == 'string') {
        flash = { type: 'error', message: flash };
      }
      flash.type = flash.type || 'error';
    
      var type = flash.type || challenge.type || 'error';
      msg = flash.message || challenge.message || challenge;
      if (typeof msg == 'string') {
        req.flash(type, msg);
      }
    }
    if (options.failureMessage) {
      msg = options.failureMessage;
      if (typeof msg == 'boolean') {
        msg = challenge.message || challenge;
      }
      if (typeof msg == 'string') {
        req.session.messages = req.session.messages || [];
        req.session.messages.push(msg);
      }
    }
    if (options.failureRedirect) {
      return res.redirect(options.failureRedirect);
    }
  
    // When failure handling is not delegated to the application, the default
    // is to respond with 401 Unauthorized.  Note that the WWW-Authenticate
    // header will be set according to the strategies in use (see
    // actions#fail).  If multiple strategies failed, each of their challenges
    // will be included in the response.
    var rchallenge = typeof challenge == 'string' ? [challenge] : [];
    var rstatus = status;
    
    // starting at j = 1 because we've handled the first case already and
    // if failures = 1, statuses is not an array.
    for (var j = 1, len = failures; j < len; j++) {
        
      rstatus = rstatus || statuses[j];
      if (typeof challenges[j] == 'string') {
        rchallenge.push(challenges[j]);
      }
    }
  
    res.statusCode = rstatus || 401;
    if (res.statusCode == 401 && rchallenge.length) {
      res.setHeader('WWW-Authenticate', rchallenge);
    }
    if (options.failWithError) {
      return next(new AuthenticationError(http.STATUS_CODES[res.statusCode], rstatus));
    }
    res.end(http.STATUS_CODES[res.statusCode]);
  }

  function succeeded(user, info, req, res, next) {
    info = info || {};
    var msg;
  
    if (options.successFlash) {
      var flash = options.successFlash;
      if (typeof flash == 'string') {
        flash = { type: 'success', message: flash };
      }
      flash.type = flash.type || 'success';
    
      var type = flash.type || info.type || 'success';
      msg = flash.message || info.message || info;
      if (typeof msg == 'string') {
        req.flash(type, msg);
      }
    }
    if (options.successMessage) {
      msg = options.successMessage;
      if (typeof msg == 'boolean') {
        msg = info.message || info;
      }
      if (typeof msg == 'string') {
        req.session.messages = req.session.messages || [];
        req.session.messages.push(msg);
      }
    }
    if (options.assignProperty) {
      req[options.assignProperty] = user;
      return next();
    }
  
    req.logIn(user, options, function(err) {
      if (err) { return next(err); }
      
      function complete() {
        if (options.successReturnToOrRedirect) {
          var url = options.successReturnToOrRedirect;
          if (req.session && req.session.returnTo) {
            url = req.session.returnTo;
            delete req.session.returnTo;
          }
          return res.redirect(url);
        }
        if (options.successRedirect) {
          return res.redirect(options.successRedirect);
        }
        next();
      }
      
      if (options.authInfo !== false) {
        passport.transformAuthInfo(info, req, function(err, tinfo) {
          if (err) { return next(err); }
          req.authInfo = tinfo;
          complete();
        });
      } else {
        complete();
      }
    });
  }
  function defaultCallback(err, user, info, status, req, res, next) {
    if (err) { 
      next(err);
    } else if (user) {
      succeeded(user, info, req, res, next);
    } else {
      failed(info, status, req, res, next);
    }
  }

  if (typeof callback != 'function') {
    callback = defaultCallback;
  } 

  var multi = true;
  
  // Cast `name` to an array, allowing authentication to pass through a chain of
  // strategies.  The first strategy to succeed, redirect, or error will halt
  // the chain.  Authentication failures will proceed through each strategy in
  // series, ultimately failing if all strategies fail.
  //
  // This is typically used on API endpoints to allow clients to authenticate
  // using their preferred choice of Basic, Digest, token-based schemes, etc.
  // It is not feasible to construct a chain of multiple strategies that involve
  // redirection (for example both Facebook and Twitter), since the first one to
  // redirect will halt the chain.
  if (!Array.isArray(name)) {
    name = [ name ];
    multi = false;
  }
  
  return function authenticate(req, res, next) {
    // accumulator for failures from each strategy in the chain
    var failures = [];
    
    function allFailed() {
      if (multi) {
        var challenges = failures.map(function(f) { return f.challenge; });
        var statuses = failures.map(function(f) { return f.status; });
        return callback(null, false, challenges, statuses, req, res, next);
      }
      callback(null, false, failures[0].challenge, failures[0].status, req, res, next);
    }
    
    (function attempt(i) {
      var layer = name[i];
      // If no more strategies exist in the chain, authentication has failed.
      if (!layer) { return allFailed(); }
    
      // Get the strategy, which will be used as prototype from which to create
      // a new instance.  Action functions will then be bound to the strategy
      // within the context of the HTTP request/response pair.
      var prototype = passport._strategy(layer);
      if (!prototype) { return next(new Error('Unknown authentication strategy "' + layer + '"')); }
    
      var strategy = Object.create(prototype);
      
      
      // ----- BEGIN STRATEGY AUGMENTATION -----
      // Augment the new strategy instance with action functions.  These action
      // functions are bound via closure the the request/response pair.  The end
      // goal of the strategy is to invoke *one* of these action methods, in
      // order to indicate successful or failed authentication, redirect to a
      // third-party identity provider, etc.
      
      /**
       * Authenticate `user`, with optional `info`.
       *
       * Strategies should call this function to successfully authenticate a
       * user.  `user` should be an object supplied by the application after it
       * has been given an opportunity to verify credentials.  `info` is an
       * optional argument containing additional user information.  This is
       * useful for third-party authentication strategies to pass profile
       * details.
       *
       * @param {Object} user
       * @param {Object} info
       * @api public
       */
      strategy.success = function(user, info) {
        callback(null, user, info, null, req, res, next);      
      };
      
      /**
       * Fail authentication, with optional `challenge` and `status`, defaulting
       * to 401.
       *
       * Strategies should call this function to fail an authentication attempt.
       *
       * @param {String} challenge
       * @param {Number} status
       * @api public
       */
      strategy.fail = function(challenge, status) {
        if (typeof challenge == 'number') {
          status = challenge;
          challenge = undefined;
        }
        
        // push this failure into the accumulator and attempt authentication
        // using the next strategy
        failures.push({ challenge: challenge, status: status });
        attempt(i + 1);
      };
      
      /**
       * Redirect to `url` with optional `status`, defaulting to 302.
       *
       * Strategies should call this function to redirect the user (via their
       * user agent) to a third-party website for authentication.
       *
       * @param {String} url
       * @param {Number} status
       * @api public
       */
      strategy.redirect = function(url, status) {
        // NOTE: Do not use `res.redirect` from Express, because it can't decide
        //       what it wants.
        //
        //       Express 2.x: res.redirect(url, status)
        //       Express 3.x: res.redirect(status, url) -OR- res.redirect(url, status)
        //         - as of 3.14.0, deprecated warnings are issued if res.redirect(url, status)
        //           is used
        //       Express 4.x: res.redirect(status, url)
        //         - all versions (as of 4.8.7) continue to accept res.redirect(url, status)
        //           but issue deprecated versions
        
        res.statusCode = status || 302;
        res.setHeader('Location', url);
        res.setHeader('Content-Length', '0');
        res.end();
      };
      
      /**
       * Pass without making a success or fail decision.
       *
       * Under most circumstances, Strategies should not need to call this
       * function.  It exists primarily to allow previous authentication state
       * to be restored, for example from an HTTP session.
       *
       * @api public
       */
      strategy.pass = function() {
        next();
      };
      
      /**
       * Internal error while performing authentication.
       *
       * Strategies should call this function when an internal error occurs
       * during the process of performing authentication; for example, if the
       * user directory is not available.
       *
       * @param {Error} err
       * @api public
       */
      strategy.error = function(err) {
        callback(err, null, null, null, req, res, next);
      };
      
      // ----- END STRATEGY AUGMENTATION -----
    
      strategy.authenticate(req, options);
    })(0); // attempt
  };
};
