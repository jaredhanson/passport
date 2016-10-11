var http = require('http')
  , Context = require('../../context')
  , IncomingMessageExt = require('../../http/request');


// https://github.com/jaredhanson/passport/pull/399
module.exports = function patchAuthenticate(passport, name, options, callback) {
  var authenticate = require('../authenticate').apply(undefined, arguments);
  
  return function patchAuthenticate(req, res, next) {
    if (http.IncomingMessage.prototype.logIn
        && http.IncomingMessage.prototype.logIn !== IncomingMessageExt.logIn) {
      require('../../framework/connect').__monkeypatchNode();
    }
    
    authenticate(req, res, next);
  };
};
