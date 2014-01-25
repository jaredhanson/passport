/**
 * Module dependencies.
 */
var Passport = require('./authenticator')
  , SessionStrategy = require('./strategies/session');


/**
 * Export default singleton.
 *
 * @api public
 */
exports = module.exports = new Passport();

/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Passport =
exports.Authenticator = Passport;
exports.Strategy = require('passport-strategy');


/**
 * Expose strategies.
 */
exports.strategies = {};
exports.strategies.SessionStrategy = SessionStrategy;


/**
 * HTTP extensions.
 */
require('./http/request');