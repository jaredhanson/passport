/**
 * `Context` constructor.
 *
 * @api private
 */
function Context(delegate, req, res, next) {
  this.delegate = delegate;
  this.req = req;
  this.res = res;
  this.next = next;
}


/**
 * Expose `Context`.
 */
module.exports = Context;
