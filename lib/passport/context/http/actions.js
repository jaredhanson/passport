/**
 * Export actions prototype for strategies operating within an HTTP context.
 */
var actions = module.exports = {};


/**
 * Authenticate `user`, with optional `info`.
 *
 * Strategies should call this function to successfully authenticate a user.
 * `user` should be an object supplied by the application after it has been
 * given an opportunity to verify credentials.  `info` is an optional argument
 * containing additional user information.  This is useful for third-party
 * authentication strategies to pass profile details.
 *
 * @param {Object} user
 * @param {Object} info
 * @api public
 */
actions.success = function(user, info) {
  this.delegate.success.apply(this, arguments);
}

/**
 * Fail authentication, with optional `challenge` and `status`, defaulting to
 * 401.
 *
 * Strategies should call this function to fail an authentication attempt.
 *
 * @param {String} challenge
 * @param {Number} status
 * @api public
 */
actions.fail = function(challenge, status) {
  this.delegate.fail.apply(this, arguments);
}

/**
 * Redirect to `url` with optional `status`, defaulting to 302.
 *
 * Strategies should call this function to redirect the user (via their user
 * agent) to a third-party website for authentication.
 *
 * @param {String} url
 * @param {Number} status
 * @api public
 */
actions.redirect = function(url, status) {
  var res = this.res;
  if (typeof res.redirect == 'function') {
    // If possible use redirect method on the response
    // Assume Express API, optional status param comes first
    if (status) {
      res.redirect(status, url);
    } else {
      res.redirect(url);
    }
  } else {
    // Otherwise fall back to native methods
    res.statusCode = status || 302;
    res.setHeader('Location', url);
    res.setHeader('Content-Length', '0');
    res.end();
  }
}

/**
 * Pass without making a success or fail decision.
 *
 * Under most circumstances, Strategies should not need to call this function.
 * It exists primarily to allow previous authentication state to be restored,
 * for example from an HTTP session.
 *
 * @api public
 */
actions.pass = function() {
  this.next();
}

/**
 * Internal error while performing authentication.
 *
 * Strategies should call this function when an internal error occurs during the
 * process of performing authentication; for example, if the user directory is
 * not available.
 *
 * @param {Error} err
 * @api public
 */
actions.error = function(err) {
  this.next(err);
}

