/**
 * Module dependencies.
 */
var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , Strategy = require('./strategy')
  , SessionStrategy = require('./strategies/session')
  , initialize = require('./middleware/initialize')
  , authenticate = require('./middleware/authenticate');


/**
 * `Passport` constructor.
 *
 * @api public
 */
function Passport() {
  this._key = 'passport';
  this._strategies = {};
  this._serializers = [];
  this._deserializers = [];
  
  this._userProperty = 'user';
  
  this.use(new SessionStrategy());
};

/**
 * Utilize the given `strategy` with optional `name`, overridding the strategy's
 * default name.
 *
 * Examples:
 *
 *     passport.use(new TwitterStrategy(...));
 *
 *     passport.use('api', new http.BasicStrategy(...));
 *
 * @param {String|Strategy} name
 * @param {Strategy} strategy
 * @return {Passport} for chaining
 * @api public
 */
Passport.prototype.use = function(name, strategy) {
  if (!strategy) {
    strategy = name;
    name = strategy.name;
  }
  if (!name) throw new Error('authentication strategies must have a name');
  
  this._strategies[name] = strategy;
  return this;
};

/**
 * Passport's primary initialization middleware.
 *
 * This middleware must be in use by the Connect/Express application for
 * Passport to operate.
 *
 * Options:
 *   - `userProperty`  Property to set on `req` upon login, defaults to _user_
 *
 * Examples:
 *
 *     app.configure(function() {
 *       app.use(passport.initialize());
 *     });
 *
 *     app.configure(function() {
 *       app.use(passport.initialize({ userProperty: 'currentUser' }));
 *     });
 *
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */
Passport.prototype.initialize = function(options) {
  options = options || {};
  this._userProperty = options.userProperty || 'user';
  
  return initialize().bind(this);
}

/**
 * Middleware that will restore login state from a session.
 *
 * Web applications typically use sessions to maintain login state between
 * requests.  For example, a user will authenticate by entering credentials into
 * a form which is submitted to the server.  If the credentials are valid, a
 * login session is established by setting a cookie containing a session
 * identifier in the user's web browser.  The web browser will send this cookie
 * in subsequent requests to the server, allowing a session to be maintained.
 *
 * If sessions are being utilized, and a login session has been established,
 * this middleware will populate `req.user` with the current user.
 *
 * Note that sessions are not strictly required for Passport to operate.
 * However, as a general rule, most web applications will make use of sessions.
 * An exception to this rule would be an API server, which expects each HTTP
 * request to provide credentials in an Authorization header.
 *
 * Examples:
 *
 *     app.configure(function() {
 *       app.use(connect.cookieParser());
 *       app.use(connect.session({ secret: 'keyboard cat' }));
 *       app.use(passport.initialize());
 *       app.use(passport.session());
 *     });
 *
 * @return {Function} middleware
 * @api public
 */
Passport.prototype.session = function() {
  return this.authenticate('session');
}

/**
 * Middleware that will authenticate a request using the given `strategy` name,
 * with optional `options` and `callback`.
 *
 * Examples:
 *
 *     passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })(req, res);
 *
 *     passport.authenticate('local', function(err, user) {
 *       if (!user) { return res.redirect('/login'); }
 *       res.end('Authenticated!');
 *     })(req, res);
 *
 *     passport.authenticate('basic', { session: false })(req, res);
 *
 *     app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {
 *       // request will be redirected to Twitter
 *     });
 *     app.get('/auth/twitter/callback', passport.authenticate('twitter'), function(req, res) {
 *       res.json(req.user);
 *     });
 *
 * @param {String} strategy
 * @param {Object} options
 * @param {Function} callback
 * @return {Function} middleware
 * @api public
 */
Passport.prototype.authenticate = function(strategy, options, callback) {
  return authenticate(strategy, options, callback).bind(this);
}

/**
 * Middleware that will authorize a third-party account using the given
 * `strategy` name, with optional `options`.
 *
 * If authorization is successful, the result provided by the strategy's verify
 * callback will be assigned to `req.account`.  The existing login session and
 * `req.user` will be unaffected.
 *
 * This function is particularly useful when connecting third-party accounts
 * to the local account of a user that is currently authenticated.
 *
 * Examples:
 *
 *    passport.authorize('twitter-authz', { failureRedirect: '/account' });
 *
 * @param {String} strategy
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */
Passport.prototype.authorize = function(strategy, options, callback) {
  options = options || {};
  options.assignProperty = 'account';
  
  return authenticate(strategy, options, callback).bind(this);
}

/**
 * Registers a function used to serialize user objects into the session.
 *
 * Examples:
 *
 *     passport.serializeUser(function(user, done) {
 *       done(null, user.id);
 *     });
 *
 * @api public
 */
Passport.prototype.serializeUser = function(fn, done) {
  if (typeof fn === 'function') {
    return this._serializers.push(fn);
  }
  
  // private implementation that traverses the chain of serializers, attempting
  // to serialize a user
  var user = fn;
  
  var stack = this._serializers;
  (function pass(i, err, obj) {
    // serializers use 'pass' as an error to skip processing
    if ('pass' === err) {
      err = undefined;
    }
    // an error or serialized object was obtained, done
    if (err || obj) { return done(err, obj); }
    
    var layer = stack[i];
    if (!layer) {
      return done(new Error('failed to serialize user into session'));
    }
    
    try {
      layer(user, function(e, o) { pass(i + 1, e, o); } )
    } catch(e) {
      return done(e);
    }
  })(0);
}

/**
 * Registers a function used to deserialize user objects out of the session.
 *
 * Examples:
 *
 *     passport.deserializeUser(function(id, done) {
 *       User.findById(id, function (err, user) {
 *         done(err, user);
 *       });
 *     });
 *
 * @api public
 */
Passport.prototype.deserializeUser = function(fn, done) {
  if (typeof fn === 'function') {
    return this._deserializers.push(fn);
  }
  
  // private implementation that traverses the chain of deserializers,
  // attempting to deserialize a user
  var obj = fn;
  
  var stack = this._deserializers;
  (function pass(i, err, user) {
    // deserializers use 'pass' as an error to skip processing
    if ('pass' === err) {
      err = undefined;
    }
    // an error or deserialized user was obtained, done
    if (err || user) { return done(err, user); }
    
    var layer = stack[i];
    if (!layer) {
      return done(new Error('failed to deserialize user out of session'));
    }
    
    try {
      layer(obj, function(e, u) { pass(i + 1, e, u); } )
    } catch(e) {
      return done(e);
    }
  })(0);
}

/**
 * Return strategy with given `name`. 
 *
 * @param {String} name
 * @return {Strategy}
 * @api private
 */
Passport.prototype._strategy = function(name) {
  return this._strategies[name];
}


/**
 * Export default singleton.
 *
 * @api public
 */
exports = module.exports = new Passport();

/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Passport = Passport;
exports.Strategy = Strategy;


/**
 * Expose strategies.
 */
exports.strategies = {};
exports.strategies.SessionStrategy = SessionStrategy;


/**
 * HTTP extensions.
 */
require('./http/request');
