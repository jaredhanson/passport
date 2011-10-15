/**
 * Export actions prototype for strategies operating within a HTTP context.
 */
var actions = module.exports = {};

actions.success = function(user) {
  this.delegate.success.apply(this, arguments);
}

actions.fail = function() {
  // TODO: set (or append) a header, if the strategy offers support
  // this.res.setHeader('WWW-Authenticate', 'Basic realm="' + 'WWW' + '"');
  this.delegate.fail.apply(this, arguments);
}

actions.redirect = function(url, status) {
  this.res.statusCode = status || 302;
  this.res.setHeader('Location', url);
  this.res.end();
}

actions.pass = function() {
  this.next();
}

actions.error = function(err) {
  this.next(err);
}

