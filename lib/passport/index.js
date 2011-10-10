/**
 * Module dependencies.
 */
var fs = require('fs')
  , path = require('path')
  , Strategy = require('./strategy')
  , authenticate = require('./middleware/authenticate')


/**
 * `Passport` constructor.
 *
 * @api public
 */
function Passport() {
  this._strategies = {};
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

Passport.prototype.authenticate = function(strategy) {
  return authenticate(strategy).bind(this);
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
