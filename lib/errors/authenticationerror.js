/**
 * `AuthenticationError` error.
 *
 * @constructor
 * @api private
 */
function AuthenticationError(message, status) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'AuthenticationError';
  this.message = message;
  this.status = status || 401;
}

// Inherit from `Error`.
Object.setPrototypeOf(AuthenticationError.prototype, Error.prototype);


// Expose constructor.
module.exports = AuthenticationError;
