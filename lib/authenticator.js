/**
 * Module dependencies.
 */
require('es6-promise').polyfill();
var co = require('co');
var SessionStrategy = require('./strategies/session');


/**
 * `Authenticator` constructor.
 *
 * @api public
 */
function Authenticator() {
  this._key = 'passport';
  this._strategies = {};
  this._serializers = [];
  this._deserializers = [];
  this._infoTransformers = [];
  this._framework = null;
  this._userProperty = 'user';
  
  this.init();
}

/**
 * Initialize authenticator.
 *
 * @api protected
 */
Authenticator.prototype.init = function() {
  this.framework(require('./framework/connect')());
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
 * @return {Authenticator} for chaining
 * @api public
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
 * Un-utilize the `strategy` with given `name`.
 *
 * In typical applications, the necessary authentication strategies are static,
 * configured once and always available.  As such, there is often no need to
 * invoke this function.
 *
 * However, in certain situations, applications may need dynamically configure
 * and de-configure authentication strategies.  The `use()`/`unuse()`
 * combination satisfies these scenarios.
 *
 * Examples:
 *
 *     passport.unuse('legacy-api');
 *
 * @param {String} name
 * @return {Authenticator} for chaining
 * @api public
 */
Authenticator.prototype.unuse = function(name) {
  delete this._strategies[name];
  return this;
};

/**
 * Setup Passport to be used under framework.
 *
 * By default, Passport exposes middleware that operate using Connect-style
 * middleware using a `fn(req, res, next)` signature.  Other popular frameworks
 * have different expectations, and this function allows Passport to be adapted
 * to operate within such environments.
 *
 * If you are using a Connect-compatible framework, including Express, there is
 * no need to invoke this function.
 *
 * Examples:
 *
 *     passport.framework(require('hapi-passport')());
 *
 * @param {Object} name
 * @return {Authenticator} for chaining
 * @api public
 */
Authenticator.prototype.framework = function(fw) {
  this._framework = fw;
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
Authenticator.prototype.initialize = function(options) {
  options = options || {};
  this._userProperty = options.userProperty || 'user';
  
  return this._framework.initialize(this, options);
};

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
Authenticator.prototype.authenticate = function(strategy, options, callback) {
  return this._framework.authenticate(this, strategy, options, callback);
};

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
 *     app.configure(function() {
 *       app.use(connect.cookieParser());
 *       app.use(connect.session({ secret: 'keyboard cat' }));
 *       app.use(passport.initialize());
 *       app.use(passport.session());
 *     });
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

/**
 * Registers a function used to serialize user objects into the session.
 *
 * Examples:
 *
 *     passport.serializeUser(function*(user) {
 *       return user.id;
 *     });
 *
 *     passport.serializeUser(function(user, done) {
 *       done(null, user.id);
 *     });
 *
 * @api public
 */
Authenticator.prototype.serializeUser = function(fn, req, done) {
  if (typeof fn === 'function') {
    return this._serializers.push(wrapToPromise(fn));
  }
  
  // private implementation that traverses the chain of serializers, attempting
  // to serialize a user
  var user = fn;

  // For backwards compatibility
  if (typeof req === 'function') {
    done = req;
    req = undefined;
  }
  
  serializeUser(this._serializers.slice(), user, req)
  .then(function(obj) {
    done(null, obj);
  }, function(err) {
    done(err);
  });
};

/**
 * Serializes user objects into the session.
 *
 * @api private
 */
function serializeUser(serializers, user, req) {
  var serializer = serializers.shift();
  if (!serializer) {
    return Promise.reject(new Error('Failed to serialize user into session'));
  }
  
  var promise = serializer.arity == 2 
    ? serializer.fn(req, user)
    : serializer.fn(user);
  
  return promise.then(function (obj) {
    if (obj || obj === 0) return obj;
    else return serializeUser(serializers, user, req);
  }, function (err) {
    if ('pass' !== err) throw err;
    else return serializeUser(serializers, user, req);
  });
}

/**
 * Registers a function used to deserialize user objects out of the session.
 *
 * Examples:
 *
 *     passport.deserializeUser(function*(id) {
 *       return yield User.findById(id);
 *     });
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
    return this._deserializers.push(wrapToPromise(fn));
  }
  
  // private implementation that traverses the chain of deserializers,
  // attempting to deserialize a user
  var obj = fn;

  // For backwards compatibility
  if (typeof req === 'function') {
    done = req;
    req = undefined;
  }
    
  deserializeUser(this._deserializers.slice(), obj, req)
  .then(function (user) {
    done(null, user);
  }, function (err) {
    done(err);
  });
};

/**
 * Deserializes user objects out of the session.
 *
 * @api private
 */
function deserializeUser(deserializers, obj, req) {
  var deserializer = deserializers.shift();
  if (!deserializer) {
    return Promise.reject(new Error('Failed to deserialize user out of session'));
  }
  
  var promise = deserializer.arity == 2 
    ? deserializer.fn(req, obj)
    : deserializer.fn(obj);
  
  return promise.then(function (user) {
    if (user === undefined) return deserializeUser(deserializers, obj, req);
    return (user === null || user === false) ? false : user;
  }, function (err) {
    if ('pass' !== err) throw err;
    else return deserializeUser(deserializers, obj, req);
  });
}

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
 *     passport.transformAuthInfo(function*(info) {
 *       var client = yield Client.findById(info.clientID);
 *       info.client = client;
 *       return info;
 *     });
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
    return this._infoTransformers.push(wrapToPromise(fn));
  }
  
  // private implementation that traverses the chain of transformers,
  // attempting to transform auth info
  var info = fn;

  // For backwards compatibility
  if (typeof req === 'function') {
    done = req;
    req = undefined;
  }
    
  transformAuthInfo(this._infoTransformers.slice(), info, req)
  .then(function (info) {
    done(null, info);
  }, function (err) {
    done(err);
  });  
};

/**
 * Function used to transform auth info.
 *
 * @api private
 */
function transformAuthInfo(transformers, info, req) {
  var transformer = transformers.shift();
  if (!transformer) {
    // if no transformers are registered (or they all pass), the default
    // behavior is to use the un-transformed info as-is
    return Promise.resolve(info);
  }
  
  var promise = transformer.arity == 2 
    ? transformer.fn(req, info)
    : transformer.fn(info);
  
  return promise.then(function (tinfo) {
    if (tinfo) return tinfo;
    else return transformAuthInfo(transformers, info, req)
  }, function (err) {
    if ('pass' !== err) throw err;
    else return transformAuthInfo(transformers, info, req);
  });
}

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
 * Wrap a `fn` to a Promise.
 *
 * @param {Function} fn
 * @return {fn: Promise, arity: Number}
 * @api private
 */
function wrapToPromise(fn) {
    
  var generator = isGenerator(fn) || isGeneratorFunction(fn);
  var arity, func;
  
  if (generator) {
    // generator function
    arity = fn.length;
    func = co.wrap(fn);
  } else if (fn.length == 1) {
    // synchronous function
    arity = 1;
    func = syncToPromise(fn);
  } else {
    // function with callback
    arity = fn.length - 1;
    func = callbackToPromise(fn);
  }
  
  return { arity: arity,  fn: func };
};

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  return constructor && 'GeneratorFunction' == constructor.name;
}


/**
 * Wrap a synchronous `fn` to a Promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api private
 */
function syncToPromise(fn) {
    
    return function () {
        
        var args = arguments;
        var ctx = this;
        
        return new Promise(function (resolve, reject) {
            try {
                resolve(fn.apply(ctx, args));
            } catch (err) {
                reject(err);
            }
        });
    };
};

/**
 * Wrap a `fn` with a callback to a Promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api private
 */
function callbackToPromise(fn) {
    
  return function () {

    var args = new Array(arguments.length);
    var ctx = this;
    
    for (var i = 0; i < args.length; ++i) {
      args[i] = arguments[i];
    }
    
    return new Promise(function (resolve, reject) {

      args.push(function (err, res) {
        if (err) reject(err);
        else resolve(res);
      });

      fn.apply(ctx, args);
    });
  }
};



/**
 * Expose `Authenticator`.
 */
module.exports = Authenticator;
