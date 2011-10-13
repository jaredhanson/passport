/**
 * Module dependencies.
 */
var fs = require('fs')
  , path = require('path')
  , Strategy = require('./strategy')
  , authentication = require('./middleware/authentication')
  , authenticate = require('./middleware/authenticate');


/**
 * `Passport` constructor.
 *
 * @api public
 */
function Passport() {
  this._strategies = {};
  this._serializers = [];
  this._deserializers = [];
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
  if (!name) throw new Error('Passport strategies must have a name');
  
  this._strategies[name] = strategy;
  return this;
};

/**
 * Passport's primary authentication middleware.
 *
 * This middleware must be in use by the Connect/Express application for
 * Passport to operate.
 *
 * Examples:
 *
 *     app.configure(function() {
 *       app.use(connect.cookieParser());
 *       app.use(connect.session({ secret: 'keyboard cat' }));
 *       app.use(passport.authentication());
 *     });
 *
 * @return {Function} middleware
 * @api public
 */
Passport.prototype.authentication = function() {
  return authentication().bind(this);
}

/**
 * Middleware that will authenticate a request using the given `strategy` name.
 *
 * Examples:
 *
 *     app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {
 *       // request will be redirected to Twitter
 *     });
 *     app.get('/auth/twitter/callback', passport.authenticate('twitter'), function(req, res) {
 *       res.json(req.user);
 *     });
 *
 * @return {Function} middleware
 * @api public
 */
Passport.prototype.authenticate = function(strategy) {
  return authenticate(strategy).bind(this);
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
Passport.prototype.serializeUser = function(fn, cb) {
  if (typeof fn === 'function') {
    return this._serializers.push(fn);
  }
  
  // private implementation that utilizes registered serializers to serialize a
  // user
  var user = fn;
  // TODO: Allow multiple serializers to be searched in a chain
  this._serializers[0](user, cb);
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
Passport.prototype.deserializeUser = function(fn, cb) {
  if (typeof fn === 'function') {
    return this._deserializers.push(fn);
  }
  
  // private implementation that utilizes registered deserializers to
  // deserialize user
  var obj = fn;
  // TODO: Allow multiple deserializers to be searched in a chain
  this._deserializers[0](obj, cb);
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
exports.version = '0.1.0';

/**
 * Expose constructors.
 */
exports.Passport = Passport;
exports.Strategy = Strategy;


/**
 * Auto-load bundled strategies.
 */
exports.strategies = {};

if (path.existsSync(__dirname + '/strategies')) {
  fs.readdirSync(__dirname + '/strategies').forEach(function(filename) {
    if (/\.js$/.test(filename)) {
      var name = filename.substr(0, filename.lastIndexOf('.'));
      exports.strategies.__defineGetter__(name, function(){
        return require('./strategies/' + name);
      });
    }
  });
}


/**
 * HTTP extensions.
 */
require('./http/request');
