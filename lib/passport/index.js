/**
 * Module dependencies.
 */
var fs = require('fs')
  , path = require('path')
  , Strategy = require('./strategy');


/**
 * `Passport` constructor.
 *
 * @api public
 */
function Passport() {
  this._strategies = [];
  this._middleware = [];
};

// TODO: Make it optional to name a strategy.  If not named, it uses its default
//       name
Passport.prototype.use = function(name, strategy) {
  this._strategies.push(strategy);
  
  var middleware = strategy.middleware;
  if (middleware) {
    if (Array.isArray(middleware)) {
      this._middleware = this._middleware.concat(middleware);
    } else {
      this._middleware.push(middleware);
    }
  }
};

Passport.prototype.middleware = function() {
  var self = this;

  return function(req, res, next) {
    var stack = self._middleware;
    
    (function pass(i, err) {
      if (err) { return next(err); }
      
      var layer = stack[i];
      if (!layer) { return next(); }
      
      try {
        layer(req, res, function(e) { pass(i + 1, e); } )
      } catch (e) {
        next(e);
      }
    })(0);
  }
};



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
 * Expose Connect middleware.
 */
exports.authenticate = require('./middleware/authenticate')(exports);



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
