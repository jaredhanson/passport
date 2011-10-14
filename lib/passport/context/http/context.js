/**
 * `Context` constructor.
 *
 * @api private
 */
function Context(passport, req, res, next) {
  this.passport = passport;
  this.req = req;
  this.res = res;
  this.next = next;
}


/**
 * Expose `Context`.
 */
module.exports = Context;
