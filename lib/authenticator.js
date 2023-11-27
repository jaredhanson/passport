// Module dependencies.
var SessionStrategy = require('./strategies/session')
  , SessionManager = require('./sessionmanager');


/**
 * Create a new `Authenticator` object.
 *
 * @public
 * @class
 */
function Authenticator() {
  this._key = 'passport';
  this._strategies = {};
  this._serializers = [];
  this._deserializers = [];
  this._infoTransformers = [];
  this._framework = null;
  
  this.init();
}

/**
 * Initialize authenticator.
 *
 * Initializes the `Authenticator` instance by creating the default `{@link SessionManager}`,
 * {@link Authenticator#use `use()`}'ing the default `{@link SessionStrategy}`, and
 * adapting it to work as {@link https://github.com/senchalabs/connect#readme Connect}-style
 * middleware, which is also compatible with {@link https://expressjs.com/ Express}.
 *
 * @private
 */
Authenticator.prototype.init = function() {
  this.framework(require('./framework/connect')());
  this.use(new SessionStrategy({ key: this._key }, this.deserializeUser.bind(this)));
  this._sm = new SessionManager({ key: this._key }, this.serializeUser.bind(this));
};

/**
 * Register a strategy for later use when authenticating requests.  The name
 * with which the strategy is registered is passed to {@link Authenticator#authenticate `authenticate()`}.
 *
 * @public
 * @param {string} [name=strategy.name] - Name of the strategy.  When specified,
 *          this value overrides the strategy's name.
 * @param {Strategy} strategy - Authentication strategy.
 * @returns {this}
 *
 * @example <caption>Register strategy.</caption>
 * passport.use(new GoogleStrategy(...));
 *
 * @example <caption>Register strategy and override name.</caption>
 * passport.use('password', new LocalStrategy(function(username, password, cb) {
 *   // ...
 * }));
 */
Authenticator.prototype.use = function(name, strategy) {
  if (!strategy) {
    strategy = name;
    name = strategy.name;
  }
  if (!name) { throw new Error('Authentication strategies must have a name'); }
  
  this._strategies[name] = strategy;
  return this;
};

/**
 * Deregister a strategy that was previously registered with the given name.
 *
 * In a typical application, the necessary authentication strategies are
 * registered when initializing the app and, once registered, are always
 * available.  As such, it is typically not necessary to call this function.
 *
 * @public
 * @param {string} name - Name of the strategy.
 * @returns {this}
 *
 * @example
 * passport.unuse('acme');
 */
Authenticator.prototype.unuse = function(name) {
  delete this._strategies[name];
  return this;
};

/**
 * Adapt this `Authenticator` to work with a specific framework.
 *
 * By default, Passport works as {@link https://github.com/senchalabs/connect#readme Connect}-style
 * middleware, which makes it compatible with {@link https://expressjs.com/ Express}.
 * For any app built using Express, there is no need to call this function.
 *
 * @public
 * @param {Object} fw
 * @returns {this}
 */
Authenticator.prototype.framework = function(fw) {
  this._framework = fw;
  return this;
};

/**
 * Create initialization middleware.
 *
 * Returns middleware that initializes Passport to authenticate requests.
 *
 * As of v0.6.x, it is typically no longer necessary to use this middleware.  It
 * exists for compatiblity with apps built using previous versions of Passport,
 * in which this middleware was necessary.
 *
 * The primary exception to the above guidance is when using strategies that
 * depend directly on `passport@0.4.x` or earlier.  These earlier versions of
 * Passport monkeypatch Node.js `http.IncomingMessage` in a way that expects
 * certain Passport-specific properties to be available.  This middleware
 * provides a compatibility layer for this situation.
 *
 * @public
 * @param {Object} [options]
 * @param {string} [options.userProperty='user'] - Determines what property on
 *          `req` will be set to the authenticated user object.
 * @param {boolean} [options.compat=true] - When `true`, enables a compatibility
 *          layer for packages that depend on `passport@0.4.x` or earlier.
 * @returns {function}
 *
 * @example
 * app.use(passport.initialize());
 */
Authenticator.prototype.initialize = function(options) {
  options = options || {};
  return this._framework.initialize(this, options);
};

/**
 * Create authentication middleware.
 *
 * Returns middleware that authenticates the request by applying the given
 * strategy (or strategies).
 *
 * Examples:
 *
 *     passport.authenticate('local', function(err, user) {
 *       if (!user) { return res.redirect('/login'); }
 *       res.end('Authenticated!');
 *     })(req, res);
 *
 * @public
 * @param {string|string[]|Strategy} strategy
 * @param {Object} [options]
 * @param {boolean} [options.session=true]
 * @param {boolean} [options.keepSessionInfo=false]
 * @param {string} [options.failureRedirect]
 * @param {boolean|string|Object} [options.failureFlash=false]
 * @param {boolean|string} [options.failureMessage=false]
 * @param {boolean|string|Object} [options.successFlash=false]
 * @param {string} [options.successReturnToOrRedirect]
 * @param {string} [options.successRedirect]
 * @param {boolean|string} [options.successMessage=false]
 * @param {boolean} [options.failWithError=false]
 * @param {string} [options.assignProperty]
 * @param {boolean} [options.authInfo=true]
 * @param {function} [callback]
 * @returns {function}
 *
 * @example <caption>Authenticate username and password submitted via HTML form.</caption>
 * app.get('/login/password', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));
 *
 * @example <caption>Authenticate bearer token used to access an API resource.</caption>
 * app.get('/api/resource', passport.authenticate('bearer', { session: false }));
 */
Authenticator.prototype.authenticate = function(strategy, options, callback) {
  return this._framework.authenticate(this, strategy, options, callback);
};

/**
 * Create third-party service authorization middleware.
 *
 * Returns middleware that will authorize a connection to a third-party service.
 *
 * This middleware is identical to using {@link Authenticator#authenticate `authenticate()`}
 * middleware with the `assignProperty` option set to `'account'`.  This is
 * useful when a user is already authenticated (for example, using a username
 * and password) and they want to connect their account with a third-party
 * service.
 *
 * In this scenario, the user's third-party account will be set at
 * `req.account`, and the existing `req.user` and login session data will be
 * be left unmodified.  A route handler can then link the third-party account to
 * the existing local account.
 *
 * All arguments to this function behave identically to those accepted by
 * `{@link Authenticator#authenticate}`.
 *
 * @public
 * @param {string|string[]|Strategy} strategy
 * @param {Object} [options]
 * @param {function} [callback]
 * @returns {function}
 *
 * @example
 * app.get('/oauth/callback/twitter', passport.authorize('twitter'));
 */
Authenticator.prototype.authorize = function(strategy, options, callback) {
  options = options || {};
  options.assignProperty = 'account';
  
  var fn = this._framework.authorize || this._framework.authenticate;
  return fn(this, strategy, options, callback);
};

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
 *     app.use(connect.cookieParser());
 *     app.use(connect.session({ secret: 'keyboard cat' }));
 *     app.use(passport.initialize());
 *     app.use(passport.session());
 *
 * Options:
 *   - `pauseStream`      Pause the request stream before deserializing the user
 *                        object from the session.  Defaults to _false_.  Should
 *                        be set to true in cases where middleware consuming the
 *                        request body is configured after passport and the
 *                        deserializeUser method is asynchronous.
 *
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */
Authenticator.prototype.session = function(options) {
  return this.authenticate('session', options);
};

// TODO: Make session manager pluggable
/*
Authenticator.prototype.sessionManager = function(mgr) {
  this._sm = mgr;
  return this;
}
*/

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
Authenticator.prototype.serializeUser = function(fn, req, done) {
  if (typeof fn === 'function') {
    return this._serializers.push(fn);
  }
  
  // private implementation that traverses the chain of serializers, attempting
  // to serialize a user
  var user = fn;

  // For backwards compatibility
  if (typeof req === 'function') {
    done = req;
    req = undefined;
  }
  
  var stack = this._serializers;
  (function pass(i, err, obj) {
    // serializers use 'pass' as an error to skip processing
    if ('pass' === err) {
      err = undefined;
    }
    // an error or serialized object was obtained, done
    if (err || obj || obj === 0) { return done(err, obj); }
    
    var layer = stack[i];
    if (!layer) {
      return done(new Error('Failed to serialize user into session'));
    }
    
    
    function serialized(e, o) {
      pass(i + 1, e, o);
    }
    
    try {
      var arity = layer.length;
      if (arity == 3) {
        layer(req, user, serialized);
      } else {
        layer(user, serialized);
      }
    } catch(e) {
      return done(e);
    }
  })(0);
};

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
Authenticator.prototype.deserializeUser = function(fn, req, done) {
  if (typeof fn === 'function') {
    return this._deserializers.push(fn);
  }
  
  // private implementation that traverses the chain of deserializers,
  // attempting to deserialize a user
  var obj = fn;

  // For backwards compatibility
  if (typeof req === 'function') {
    done = req;
    req = undefined;
  }
  
  var stack = this._deserializers;
  (function pass(i, err, user) {
    // deserializers use 'pass' as an error to skip processing
    if ('pass' === err) {
      err = undefined;
    }
    // an error or deserialized user was obtained, done
    if (err || user) { return done(err, user); }
    // a valid user existed when establishing the session, but that user has
    // since been removed
    if (user === null || user === false) { return done(null, false); }
    
    var layer = stack[i];
    if (!layer) {
      return done(new Error('Failed to deserialize user out of session'));
    }
    
    
    function deserialized(e, u) {
      pass(i + 1, e, u);
    }
    
    try {
      var arity = layer.length;
      if (arity == 3) {
        layer(req, obj, deserialized);
      } else {
        layer(obj, deserialized);
      }
    } catch(e) {
      return done(e);
    }
  })(0);
};

/**
 * Registers a function used to transform auth info.
 *
 * In some circumstances authorization details are contained in authentication
 * credentials or loaded as part of verification.
 *
 * For example, when using bearer tokens for API authentication, the tokens may
 * encode (either directly or indirectly in a database), details such as scope
 * of access or the client to which the token was issued.
 *
 * Such authorization details should be enforced separately from authentication.
 * Because Passport deals only with the latter, this is the responsiblity of
 * middleware or routes further along the chain.  However, it is not optimal to
 * decode the same data or execute the same database query later.  To avoid
 * this, Passport accepts optional `info` along with the authenticated `user`
 * in a strategy's `success()` action.  This info is set at `req.authInfo`,
 * where said later middlware or routes can access it.
 *
 * Optionally, applications can register transforms to proccess this info,
 * which take effect prior to `req.authInfo` being set.  This is useful, for
 * example, when the info contains a client ID.  The transform can load the
 * client from the database and include the instance in the transformed info,
 * allowing the full set of client properties to be convieniently accessed.
 *
 * If no transforms are registered, `info` supplied by the strategy will be left
 * unmodified.
 *
 * Examples:
 *
 *     passport.transformAuthInfo(function(info, done) {
 *       Client.findById(info.clientID, function (err, client) {
 *         info.client = client;
 *         done(err, info);
 *       });
 *     });
 *
 * @api public
 */
Authenticator.prototype.transformAuthInfo = function(fn, req, done) {
  if (typeof fn === 'function') {
    return this._infoTransformers.push(fn);
  }
  
  // private implementation that traverses the chain of transformers,
  // attempting to transform auth info
  var info = fn;

  // For backwards compatibility
  if (typeof req === 'function') {
    done = req;
    req = undefined;
  }
  
  var stack = this._infoTransformers;
  (function pass(i, err, tinfo) {
    // transformers use 'pass' as an error to skip processing
    if ('pass' === err) {
      err = undefined;
    }
    // an error or transformed info was obtained, done
    if (err || tinfo) { return done(err, tinfo); }
    
    var layer = stack[i];
    if (!layer) {
      // if no transformers are registered (or they all pass), the default
      // behavior is to use the un-transformed info as-is
      return done(null, info);
    }
    
    
    function transformed(e, t) {
      pass(i + 1, e, t);
    }
    
    try {
      var arity = layer.length;
      if (arity == 1) {
        // sync
        var t = layer(info);
        transformed(null, t);
      } else if (arity == 3) {
        layer(req, info, transformed);
      } else {
        layer(info, transformed);
      }
    } catch(e) {
      return done(e);
    }
  })(0);
};

/**
 * Return strategy with given `name`. 
 *
 * @param {String} name
 * @return {Strategy}
 * @api private
 */
Authenticator.prototype._strategy = function(name) {
  return this._strategies[name];
};


/**
 * Expose `Authenticator`.
 */
module.exports = Authenticator;
