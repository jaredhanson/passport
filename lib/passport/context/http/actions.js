/**
 * Export actions prototype.
 */
var actions = module.exports = {};

actions.success = function(user) {
  var self = this;
  this.passport.serializeUser(user, function(err, obj) {
    if (err) { return self.next(err); }
    self.req._passport.session.user = obj;
    self.req.user = user;
    self.next();
  });
}

actions.error = function(err) {
  this.next(err);
}

actions.unauthorized = function() {
  this.res.statusCode = 401;
  // TODO: Set the value of the WWW-Authenticate header according to the
  //       strategy in use.
  this.res.setHeader('WWW-Authenticate', 'Basic realm="' + 'WWW' + '"');
  this.res.end('Authentication Required');
}

actions.redirect = function(url, status) {
  this.res.statusCode = status || 302;
  this.res.setHeader('Location', url);
  this.res.end();
}
