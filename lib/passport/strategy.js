/**
 * Module dependencies.
 */
var util = require('util');


/**
 * `Strategy` constructor.
 *
 * @api public
 */
function Strategy(options) {
  options = options || {};
  this.name = options.name;
}

Strategy.prototype._handle = function(req, res, next) {
  this.authenticate(req, res, next);
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
