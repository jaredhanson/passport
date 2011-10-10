/**
 * Module dependencies.
 */
var util = require('util');


/**
 * `Strategy` constructor.
 *
 * @api public
 */
function Strategy() {
  this.middleware = [];
}

Strategy.prototype.authenticate = function(req) {
  throw new Error('Strategy#authenticate must be overridden by subclass');
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
