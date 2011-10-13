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

// TODO: Make it optional to name a strategy.  If not named, it uses its default
//       name.
Passport.prototype.use = function(name, strategy) {
  if (!strategy) {
    strategy = name;
    name = strategy.name;
  }
  
  this._strategies[name] = strategy;
};

Passport.prototype.authentication = function() {
  return authentication().bind(this);
}

Passport.prototype.authenticate = function(strategy) {
  return authenticate(strategy).bind(this);
}

Passport.prototype.serializeUser = function(fn, cb) {
  if (typeof fn === 'function') {
    return this._serializers.push(fn);
  }
  
  // serialize user
  var user = fn;
  // TODO: Allow multiple serializers to be searched in a chain
  this._serializers[0](user, cb);
}

Passport.prototype.deserializeUser = function(fn, cb) {
  if (typeof fn === 'function') {
    return this._deserializers.push(fn);
  }
  
  // deserialize object
  var obj = fn;
  // TODO: Allow multiple deserializers to be searched in a chain
  this._deserializers[0](obj, cb);
}

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
