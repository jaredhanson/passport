/**
 * `Context` constructor.
 *
 * @api private
 */
function Context(req, res, options, passport) {
  this.req = req;
  this.res = res;
  this.options = options;
  // TODO: Factor this out.
  this.passport = passport;
}


/**
 * Expose `Context`.
 */
module.exports = Context;
