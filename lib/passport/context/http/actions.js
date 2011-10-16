/**
 * Export actions prototype for strategies operating within an HTTP context.
 */
var actions = module.exports = {};

actions.success = function(user) {
  this.delegate.success.apply(this, arguments);
}

actions.fail = function() {
  // TODO: set (or append) a header, if the strategy offers support
  //       possibly set the header via an argument.  fail('Basic ...')
  // this.res.setHeader('WWW-Authenticate', 'Basic realm="' + 'WWW' + '"');
  this.delegate.fail.apply(this);
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

