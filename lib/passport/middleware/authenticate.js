module.exports = function authenticate(passport) {
  
  return function authenticate(req, res, next) {
    // TODO: Allow the strategy (or strategies) to be selected by name.
    var s = passport._strategies[0];
    s._handle(req, res, next);
    next();
  }
}
