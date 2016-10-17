var http = require('http')
  , AuthenticationError = require('../errors/authenticationerror');


exports.success = function(user, info, next) {
  var req = this.req
    , res = this.res
    , options = this.options
    , passport = this.passport
    
  var msg;

  if (options.successFlash) {
    var flash = options.successFlash;
    if (typeof flash == 'string') {
      flash = { type: 'success', message: flash };
    }
    flash.type = flash.type || 'success';
  
    var type = flash.type || info.type || 'success';
    msg = flash.message || info.message || info;
    if (typeof msg == 'string') {
      req.flash(type, msg);
    }
  }
  if (options.successMessage) {
    msg = options.successMessage;
    if (typeof msg == 'boolean') {
      msg = info.message || info;
    }
    if (typeof msg == 'string') {
      req.session.messages = req.session.messages || [];
      req.session.messages.push(msg);
    }
  }
  if (options.assignProperty) {
    req[options.assignProperty] = user;
    return next();
  }

  req.logIn(user, options, function(err) {
    if (err) { return next(err); }
    
    function complete() {
      if (options.successReturnToOrRedirect) {
        var url = options.successReturnToOrRedirect;
        if (req.session && req.session.returnTo) {
          url = req.session.returnTo;
          delete req.session.returnTo;
        }
        return res.redirect(url);
      }
      if (options.successRedirect) {
        return res.redirect(options.successRedirect);
      }
      next();
    }
    
    if (options.authInfo !== false) {
      // TODO: Factor this out.
      passport.transformAuthInfo(info, req, function(err, tinfo) {
        if (err) { return next(err); }
        req.authInfo = tinfo;
        complete();
      });
    } else {
      complete();
    }
  });
}

exports.fail = function(failures, next) {
  var req = this.req
    , res = this.res
    , options = this.options;
  
  // Strategies are ordered by priority.  For the purpose of flashing a
  // message, the first failure will be displayed.
  var failure = failures[0] || {}
    , challenge = failure.challenge || {}
    , msg;

  if (options.failureFlash) {
    var flash = options.failureFlash;
    if (typeof flash == 'string') {
      flash = { type: 'error', message: flash };
    }
    flash.type = flash.type || 'error';
  
    var type = flash.type || challenge.type || 'error';
    msg = flash.message || challenge.message || challenge;
    if (typeof msg == 'string') {
      req.flash(type, msg);
    }
  }
  if (options.failureMessage) {
    msg = options.failureMessage;
    if (typeof msg == 'boolean') {
      msg = challenge.message || challenge;
    }
    if (typeof msg == 'string') {
      req.session.messages = req.session.messages || [];
      req.session.messages.push(msg);
    }
  }
  if (options.failureRedirect) {
    return res.redirect(options.failureRedirect);
  }

  // When failure handling is not delegated to the application, the default
  // is to respond with 401 Unauthorized.  Note that the WWW-Authenticate
  // header will be set according to the strategies in use (see
  // actions#fail).  If multiple strategies failed, each of their challenges
  // will be included in the response.
  var rchallenge = []
    , rstatus, status;
  
  for (var j = 0, len = failures.length; j < len; j++) {
    failure = failures[j];
    challenge = failure.challenge;
    status = failure.status;
      
    rstatus = rstatus || status;
    if (typeof challenge == 'string') {
      rchallenge.push(challenge);
    }
  }

  res.statusCode = rstatus || 401;
  if (res.statusCode == 401 && rchallenge.length) {
    res.setHeader('WWW-Authenticate', rchallenge);
  }
  if (options.failWithError) {
    return next(new AuthenticationError(http.STATUS_CODES[res.statusCode], rstatus));
  }
  res.end(http.STATUS_CODES[res.statusCode]);
}

exports.redirect = function(url, status) {
  var req = this.req
    , res = this.res;
  
  // NOTE: Do not use `res.redirect` from Express, because it can't decide
  //       what it wants.
  //
  //       Express 2.x: res.redirect(url, status)
  //       Express 3.x: res.redirect(status, url) -OR- res.redirect(url, status)
  //         - as of 3.14.0, deprecated warnings are issued if res.redirect(url, status)
  //           is used
  //       Express 4.x: res.redirect(status, url)
  //         - all versions (as of 4.8.7) continue to accept res.redirect(url, status)
  //           but issue deprecated versions
  res.statusCode = status || 302;
  res.setHeader('Location', url);
  res.setHeader('Content-Length', '0');
  res.end();
}
