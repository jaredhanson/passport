var vows = require('vows');
var assert = require('assert');
var passport = require('passport');
var util = require('util');
var Passport = require('passport').Passport;


function MockSuccessStrategy() {
}

MockSuccessStrategy.prototype.authenticate = function(req, options) {
  var user = { id: '1', username: 'jaredhanson' };
  if (options && options.scope && options.scope === 'email') {
    user.email = 'jaredhanson@example.com';
  }
  
  this.success(user);
}

function MockSuccessInfoMessageStrategy() {
}

MockSuccessInfoMessageStrategy.prototype.authenticate = function(req) {
  var user = { id: '1', username: 'jaredhanson' };
  this.success(user, { message: 'Welcome!' });
}

function MockSuccessInfoTypeAndMessageStrategy() {
}

MockSuccessInfoTypeAndMessageStrategy.prototype.authenticate = function(req) {
  var user = { id: '1', username: 'jaredhanson' };
  this.success(user, { type: 'info', message: 'Hello' });
}

function MockSuccessStringMessageStrategy() {
}

MockSuccessStringMessageStrategy.prototype.authenticate = function(req) {
  var user = { id: '1', username: 'jaredhanson' };
  this.success(user, 'Greetings');
}

function MockSuccessTokenStrategy() {
}

MockSuccessTokenStrategy.prototype.authenticate = function(req) {
  var user = { id: '1', username: 'jaredhanson' };
  this.success(user, { token: 'abcd', clientId: '123' });
}

function MockFailureStrategy() {
}

MockFailureStrategy.prototype.authenticate = function(req) {
  this.fail();
}

function MockFailureInfoMessageStrategy() {
}

MockFailureInfoMessageStrategy.prototype.authenticate = function(req) {
  this.fail({ message: 'Invalid password' });
}

function MockFailureInfoTypeAndMessageStrategy() {
}

MockFailureInfoTypeAndMessageStrategy.prototype.authenticate = function(req) {
  this.fail({ type: 'notice', message: 'Invite required' });
}

function MockFailureStringMessageStrategy() {
}

MockFailureStringMessageStrategy.prototype.authenticate = function(req) {
  this.fail('Access denied');
}

function MockChallengeStrategy() {
}

MockChallengeStrategy.prototype.authenticate = function(req) {
  this.fail('Mock challenge');
}

function MockForbiddenStrategy() {
}

MockForbiddenStrategy.prototype.authenticate = function(req) {
  this.fail('Mock challenge', 403);
}

function MockBadRequestStrategy() {
}

MockBadRequestStrategy.prototype.authenticate = function(req) {
  this.fail(400);
}


function MockLocalStrategy(options) {
  this.options = options || {};
}

MockLocalStrategy.prototype.authenticate = function(req) {
  if (!this.options.fail) {
    this.success({ username: 'bob-local' });
  } else {
    this.fail('Bad username or password');
  }
}

function MockSingleUseTokenStrategy(options) {
  this.options = options || {};
}

MockSingleUseTokenStrategy.prototype.authenticate = function(req) {
  if (!this.options.fail) {
    this.success({ username: 'bob-sut' });
  } else {
    this.fail('Bad token');
  }
}

function MockBasicStrategy(options) {
  this.options = options || {};
}

MockBasicStrategy.prototype.authenticate = function(req) {
  if (!this.options.fail) {
    this.success({ username: 'bob-basic' });
  } else {
    this.fail('Basic foo', this.options.statusCode);
  }
}

function MockDigestStrategy(options) {
  this.options = options || {};
}

MockDigestStrategy.prototype.authenticate = function(req) {
  if (!this.options.fail) {
    this.success({ username: 'bob-digest' });
  } else {
    this.fail('Digest foo', this.options.statusCode);
  }
}

function MockNoChallengeStrategy(options) {
  this.options = options || {};
}

MockNoChallengeStrategy.prototype.authenticate = function(req) {
  if (!this.options.fail) {
    this.success({ username: 'bob-nc' });
  } else {
    this.fail(this.options.statusCode);
  }
}


function MockRequest() {
}

MockRequest.prototype.logIn = function(user, options, done) {
  if (this.loginError) {
    done(new Error('login error'));
  } else {
    this.user = user;
    done();
  }
}

function MockResponse() {
  this._headers = {};
}

MockResponse.prototype.setHeader = function(name, value) {
  this._headers[name] = value;
}


vows.describe('authenticate').addBatch({
  
  // OK
  'with a successful authentication': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy());
      return passport.authenticate('success');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should not set email on user according to scope' : function(err, req, res) {
        assert.isUndefined(req.user.email);
      },
      'should have empty auth info' : function(err, req, res) {
        assert.isObject(req.authInfo);
        assert.lengthOf(Object.keys(req.authInfo), 0);
      },
    },
  },
  
  // OK
  'with a successful authentication passing options to strategy': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy());
      return passport.authenticate('success', { scope: 'email' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set email on user according to scope' : function(err, req, res) {
        assert.equal(req.user.email, 'jaredhanson@example.com');
      },
      'should have empty auth info' : function(err, req, res) {
        assert.isObject(req.authInfo);
        assert.lengthOf(Object.keys(req.authInfo), 0);
      },
    },
  },
  
  // OK
  'with a successful authentication but failed login': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy());
      return passport.authenticate('success');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        req.loginError = true;
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.instanceOf(err, Error);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should not set auth info on request' : function(err, req, res) {
        assert.isUndefined(req.authInfo);
      },
    },
  },
  
  // OK
  'with a successful authentication and redirect option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      return passport.authenticate('success', { successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should have empty auth info' : function(err, req, res) {
        assert.isObject(req.authInfo);
        assert.lengthOf(Object.keys(req.authInfo), 0);
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication and return to or redirect option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      return passport.authenticate('success', { successReturnToOrRedirect: 'http://www.example.com/default' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        req.session = { returnTo: 'http://www.example.com/return' }
        var res = new MockResponse();
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/return');
      },
      'should remove returnTo from session' : function(err, req, res) {
        assert.isUndefined(req.session.returnTo);
      },
    },
  },
  
  // OK
  'with a successful authentication and return to or redirect option with no return to set in session': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      return passport.authenticate('success', { successReturnToOrRedirect: 'http://www.example.com/default' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/default');
      },
    },
  },
  
  // OK
  'with a successful authentication containing token info and no transforms': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('token', new MockSuccessTokenStrategy);
      return passport.authenticate('token');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set authInfo on request' : function(err, req, res) {
        assert.isObject(req.authInfo);
        assert.lengthOf(Object.keys(req.authInfo), 2);
        assert.equal(req.authInfo.token, 'abcd');
        assert.equal(req.authInfo.clientId, '123');
      },
    },
  },
  
  // OK
  'with a successful authentication containing token info and a transform': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('token', new MockSuccessTokenStrategy);
      passport.transformAuthInfo(function(info, done) {
        done(null, { clientId: info.clientId, client: { name: 'foo' }});
      });
      return passport.authenticate('token');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set authInfo on request' : function(err, req, res) {
        assert.isObject(req.authInfo);
        assert.lengthOf(Object.keys(req.authInfo), 2);
        assert.isUndefined(req.authInfo.token);
        assert.equal(req.authInfo.clientId, '123');
        assert.equal(req.authInfo.client.name, 'foo');
      },
    },
  },
  
  // OK
  'with a successful authentication containing token info and a transform that errors': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('token', new MockSuccessTokenStrategy);
      passport.transformAuthInfo(function(info, done) {
        done(new Error('something went wrong'));
      });
      return passport.authenticate('token');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should generate an error' : function(err, req, res) {
        assert.instanceOf(err, Error);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should not set authInfo on request' : function(err, req, res) {
        assert.isUndefined(req.authInfo);
      },
    },
  },
  
  // OK
  'with a successful authentication containing token info and authInfo option set to false': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('token', new MockSuccessTokenStrategy);
      return passport.authenticate('token', { authInfo: false });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should not set authInfo on request' : function(err, req, res) {
        assert.isUndefined(req.authInfo);
      },
    },
  },
  
  // OK
  'with a successful authentication containing info message using string message option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoMessageStrategy);
      return passport.authenticate('success', { successMessage: 'Login complete',
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.session = {};
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set message on request' : function(err, req, res) {
        assert.lengthOf(req.session.messages, 1);
        assert.equal(req.session.messages[0], 'Login complete');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info message using string message option with existing messages': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoMessageStrategy);
      return passport.authenticate('success', { successMessage: 'Login complete',
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.session = {};
        req.session.messages = [ 'I exist!' ];
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set message on request' : function(err, req, res) {
        assert.lengthOf(req.session.messages, 2);
        assert.equal(req.session.messages[0], 'I exist!');
        assert.equal(req.session.messages[1], 'Login complete');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info message using boolean message option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoMessageStrategy);
      return passport.authenticate('success', { successMessage: true,
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.session = {};
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set message on request' : function(err, req, res) {
        assert.lengthOf(req.session.messages, 1);
        assert.equal(req.session.messages[0], 'Welcome!');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info type and message using boolean message option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoTypeAndMessageStrategy);
      return passport.authenticate('success', { successMessage: true,
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.session = {};
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set message on request' : function(err, req, res) {
        assert.lengthOf(req.session.messages, 1);
        assert.equal(req.session.messages[0], 'Hello');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info message using boolean flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoMessageStrategy);
      return passport.authenticate('success', { successFlash: true,
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set message in auth info' : function(err, req, res) {
        assert.isObject(req.authInfo);
        assert.lengthOf(Object.keys(req.authInfo), 1);
        assert.equal(req.authInfo.message, 'Welcome!');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'success');
        assert.equal(req.message.msg, 'Welcome!');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info message using string flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoMessageStrategy);
      return passport.authenticate('success', { successFlash: 'Login complete',
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'success');
        assert.equal(req.message.msg, 'Login complete');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info message using flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoMessageStrategy);
      return passport.authenticate('success', { successFlash: { type: 'notice', message: 'Last login was yesterday' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'notice');
        assert.equal(req.message.msg, 'Last login was yesterday');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info message using flash option with message only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoMessageStrategy);
      return passport.authenticate('success', { successFlash: { message: 'OK' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'success');
        assert.equal(req.message.msg, 'OK');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info message using flash option with type only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoMessageStrategy);
      return passport.authenticate('success', { successFlash: { type: 'info' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'info');
        assert.equal(req.message.msg, 'Welcome!');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info type and message using boolean flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoTypeAndMessageStrategy);
      return passport.authenticate('success', { successFlash: true,
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'info');
        assert.equal(req.message.msg, 'Hello');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info type and message using string flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoTypeAndMessageStrategy);
      return passport.authenticate('success', { successFlash: 'Success!',
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'success');
        assert.equal(req.message.msg, 'Success!');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  'with a successful authentication containing info type and message using flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoTypeAndMessageStrategy);
      return passport.authenticate('success', { successFlash: { type: 'warn', message: 'Last login from far away place' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'warn');
        assert.equal(req.message.msg, 'Last login from far away place');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info type and message using flash option with message only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoTypeAndMessageStrategy);
      return passport.authenticate('success', { successFlash: { message: 'Okay' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'success');
        assert.equal(req.message.msg, 'Okay');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing info type and message using flash option with type only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoTypeAndMessageStrategy);
      return passport.authenticate('success', { successFlash: { type: 'ok' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'ok');
        assert.equal(req.message.msg, 'Hello');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing string message using boolean flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStringMessageStrategy);
      return passport.authenticate('success', { successFlash: true,
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'success');
        assert.equal(req.message.msg, 'Greetings');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  'with a successful authentication containing string message using string flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStringMessageStrategy);
      return passport.authenticate('success', { successFlash: 'Login complete',
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'success');
        assert.equal(req.message.msg, 'Login complete');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing string message using flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStringMessageStrategy);
      return passport.authenticate('success', { successFlash: { type: 'notice', message: 'Last login was yesterday' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'notice');
        assert.equal(req.message.msg, 'Last login was yesterday');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing string message using flash option with message only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStringMessageStrategy);
      return passport.authenticate('success', { successFlash: { message: 'OK' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'success');
        assert.equal(req.message.msg, 'OK');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication containing string message using flash option with type only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStringMessageStrategy);
      return passport.authenticate('success', { successFlash: { type: 'info' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'info');
        assert.equal(req.message.msg, 'Greetings');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication lacking info message using boolean flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      return passport.authenticate('success', { successFlash: true,
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should not set flash on request' : function(err, req, res) {
        assert.isUndefined(req.message);
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication lacking info message using string flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      return passport.authenticate('success', { successFlash: 'Login complete',
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'success');
        assert.equal(req.message.msg, 'Login complete');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication lacking info message using flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      return passport.authenticate('success', { successFlash: { type: 'notice', message: 'Last login was yesterday' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'notice');
        assert.equal(req.message.msg, 'Last login was yesterday');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication lacking info message using flash option with message only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      return passport.authenticate('success', { successFlash: { message: 'OK' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'success');
        assert.equal(req.message.msg, 'OK');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication lacking info message using flash option with type only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      return passport.authenticate('success', { successFlash: { type: 'info' },
                                                successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should not set flash on request' : function(err, req, res) {
        assert.isUndefined(req.message);
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  // OK
  'with a successful authentication and assignProperty option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      return passport.authenticate('success', { assignProperty: 'account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set account on request' : function(err, req, res) {
        assert.isObject(req.account);
        assert.equal(req.account.id, '1');
        assert.equal(req.account.username, 'jaredhanson');
      },
    },
  },
  
  // OK
  'with a successful authentication and callback': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessInfoMessageStrategy);
      var callback = function(err, user, info) {
        this.done(err, user, info);
      }
      var context = {};
      
      var authenticate = passport.authenticate('success', callback.bind(context));
      process.nextTick(function () {
        self.callback(null, authenticate, context);
      });
    },
    
    'when handling a request': {
      topic: function(authenticate, context) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        context.done = function(err, user, info) {
          self.callback(err, req, res, user, info);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res, user, info) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res, user, info) {
        assert.isUndefined(req.user);
      },
      'should pass user to callback' : function(err, req, res, user, info) {
        assert.isObject(user);
        assert.equal(user.id, '1');
        assert.equal(user.username, 'jaredhanson');
      },
      'should pass profile to callback' : function(err, req, res, user, info) {
        assert.isObject(info);
        assert.equal(info.message, 'Welcome!');
      },
    },
  },
  
  
  // OK
  'with a failed authentication': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStrategy());
      return passport.authenticate('failure');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.end = function() {
          self.callback(null, req, res)
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set status code to unauthorized' : function(err, req, res) {
        assert.equal(res.statusCode, 401);
      },
    },
  },
  
  // OK
  'with a failed authentication and redirect option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStrategy());
      return passport.authenticate('failure', { failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  // OK
  'with a failed authentication and callback': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStrategy());
      var callback = function(err, user) {
        this.done(err, user);
      }
      var context = {};
      
      var authenticate = passport.authenticate('failure', callback.bind(context));
      process.nextTick(function () {
        self.callback(null, authenticate, context);
      });
    },
    
    'when handling a request': {
      topic: function(authenticate, context) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        context.done = function(err, user) {
          self.callback(err, req, res, user);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res, user) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res, user) {
        assert.isUndefined(req.user);
      },
      'should pass user to callback as false' : function(err, req, res, user) {
        assert.isFalse(user);
      },
    },
  },
  
  // OK
  'with a failed authentication containing info message using callback': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoMessageStrategy());
      var callback = function(err, user, info) {
        this.done(err, user, info);
      }
      var context = {};
      
      var authenticate = passport.authenticate('failure', callback.bind(context));
      process.nextTick(function () {
        self.callback(null, authenticate, context);
      });
    },
    
    'when handling a request': {
      topic: function(authenticate, context) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        context.done = function(err, user, info) {
          self.callback(err, req, res, user, info);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res, user) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res, user) {
        assert.isUndefined(req.user);
      },
      'should pass user to callback as false' : function(err, req, res, user) {
        assert.isFalse(user);
      },
      'should pass info to callback' : function(err, req, res, user, info) {
        assert.isObject(info);
        assert.equal(info.message, 'Invalid password');
      },
    },
  },
  
  // OK
  'with a failed authentication containing info message using string message option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoMessageStrategy());
      return passport.authenticate('failure', { failureMessage: 'Wrong credentials',
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.session = {};
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.lengthOf(req.session.messages, 1);
        assert.equal(req.session.messages[0], 'Wrong credentials');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  // OK
  'with a failed authentication containing info message using string message option with existing messages': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoMessageStrategy());
      return passport.authenticate('failure', { failureMessage: 'Wrong credentials',
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.session = {};
        req.session.messages = [ 'I exist!' ];
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.lengthOf(req.session.messages, 2);
        assert.equal(req.session.messages[0], 'I exist!');
        assert.equal(req.session.messages[1], 'Wrong credentials');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  // OK
  'with a failed authentication containing info message using boolean message option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoMessageStrategy());
      return passport.authenticate('failure', { failureMessage: true,
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.session = {};
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.lengthOf(req.session.messages, 1);
        assert.equal(req.session.messages[0], 'Invalid password');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  // OK
  'with a failed authentication containing info type and message using boolean message option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoTypeAndMessageStrategy());
      return passport.authenticate('failure', { failureMessage: true,
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.session = {};
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.lengthOf(req.session.messages, 1);
        assert.equal(req.session.messages[0], 'Invite required');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing info message using boolean flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoMessageStrategy());
      return passport.authenticate('failure', { failureFlash: true,
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'error');
        assert.equal(req.message.msg, 'Invalid password');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing info message using string flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoMessageStrategy());
      return passport.authenticate('failure', { failureFlash: 'Wrong credentials',
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'error');
        assert.equal(req.message.msg, 'Wrong credentials');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing info message using flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoMessageStrategy());
      return passport.authenticate('failure', { failureFlash: { type: 'notice', message: 'Try again' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'notice');
        assert.equal(req.message.msg, 'Try again');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing info message using flash option with message only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoMessageStrategy());
      return passport.authenticate('failure', { failureFlash: { message: 'Try again' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'error');
        assert.equal(req.message.msg, 'Try again');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing info message using flash option with type only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoMessageStrategy());
      return passport.authenticate('failure', { failureFlash: { type: 'info' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'info');
        assert.equal(req.message.msg, 'Invalid password');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing info type and message using boolean flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoTypeAndMessageStrategy());
      return passport.authenticate('failure', { failureFlash: true,
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'notice');
        assert.equal(req.message.msg, 'Invite required');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing info type and message using string flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoTypeAndMessageStrategy());
      return passport.authenticate('failure', { failureFlash: 'Wrong credentials',
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'error');
        assert.equal(req.message.msg, 'Wrong credentials');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing info type and message using flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoTypeAndMessageStrategy());
      return passport.authenticate('failure', { failureFlash: { type: 'info', message: 'Try again' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'info');
        assert.equal(req.message.msg, 'Try again');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing info type and message using flash option with message only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoTypeAndMessageStrategy());
      return passport.authenticate('failure', { failureFlash: { message: 'Try again' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'error');
        assert.equal(req.message.msg, 'Try again');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing info type and message using flash option with type only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoTypeAndMessageStrategy());
      return passport.authenticate('failure', { failureFlash: { type: 'info' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'info');
        assert.equal(req.message.msg, 'Invite required');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing string message using boolean flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStringMessageStrategy());
      return passport.authenticate('failure', { failureFlash: true,
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'error');
        assert.equal(req.message.msg, 'Access denied');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing string message using string flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStringMessageStrategy());
      return passport.authenticate('failure', { failureFlash: 'Wrong credentials',
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'error');
        assert.equal(req.message.msg, 'Wrong credentials');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing string message using flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStringMessageStrategy());
      return passport.authenticate('failure', { failureFlash: { type: 'notice', message: 'Try again' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'notice');
        assert.equal(req.message.msg, 'Try again');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing string message using flash option with message only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStringMessageStrategy());
      return passport.authenticate('failure', { failureFlash: { message: 'Try again' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'error');
        assert.equal(req.message.msg, 'Try again');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication containing string message using flash option with type only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStringMessageStrategy());
      return passport.authenticate('failure', { failureFlash: { type: 'info' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'info');
        assert.equal(req.message.msg, 'Access denied');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication without info message and boolean flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStrategy());
      return passport.authenticate('failure', { failureFlash: true,
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should not set flash on request' : function(err, req, res) {
        assert.isUndefined(req.message);
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication without info message and string flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStrategy());
      return passport.authenticate('failure', { failureFlash: 'Wrong credentials',
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'error');
        assert.equal(req.message.msg, 'Wrong credentials');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication without info message and flash option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStrategy());
      return passport.authenticate('failure', { failureFlash: { type: 'notice', message: 'Try again' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'notice');
        assert.equal(req.message.msg, 'Try again');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication without info message and flash option with message only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStrategy());
      return passport.authenticate('failure', { failureFlash: { message: 'Try again' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'error');
        assert.equal(req.message.msg, 'Try again');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication without info message and flash option with type only': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStrategy());
      return passport.authenticate('failure', { failureFlash: { type: 'info' },
                                                failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should not set flash on request' : function(err, req, res) {
        assert.isUndefined(req.message);
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a challenged authentication': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('challenge', new MockChallengeStrategy());
      return passport.authenticate('challenge');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.end = function() {
          self.callback(null, req, res)
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set status code to unauthorized' : function(err, req, res) {
        assert.equal(res.statusCode, 401);
      },
      'should set WWW-Authenticate to challenge' : function(err, req, res) {
        assert.equal(res._headers['WWW-Authenticate'], 'Mock challenge');
      },
    },
  },
  
  'with a challenged authentication and status code': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('forbidden', new MockForbiddenStrategy());
      return passport.authenticate('forbidden');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.end = function() {
          self.callback(null, req, res)
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set status code to unauthorized' : function(err, req, res) {
        assert.equal(res.statusCode, 403);
      },
      'should set WWW-Authenticate to challenge' : function(err, req, res) {
        assert.equal(res._headers['WWW-Authenticate'], 'Mock challenge');
      },
    },
  },
  
  'with a failed authentication due to bad request': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('bad-request', new MockBadRequestStrategy());
      return passport.authenticate('bad-request');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.end = function() {
          self.callback(null, req, res)
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set status code to bad request' : function(err, req, res) {
        assert.equal(res.statusCode, 400);
      },
      'should not set WWW-Authenticate header' : function(err, req, res) {
        assert.isUndefined(res._headers['WWW-Authenticate']);
      },
    },
  },
  
  'with a multiple UI strategies with the first one succeeding': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('local', new MockLocalStrategy());
      passport.use('single-use-token', new MockSingleUseTokenStrategy());
      return passport.authenticate(['local', 'single-use-token']);
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.username, 'bob-local');
      },
    },
  },
  
  'with a multiple UI strategies with the second one succeeding': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('local', new MockLocalStrategy({ fail: true }));
      passport.use('single-use-token', new MockSingleUseTokenStrategy());
      return passport.authenticate(['local', 'single-use-token']);
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.username, 'bob-sut');
      },
    },
  },
  
  'with a multiple UI strategies with the both failing with flash message': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('local', new MockLocalStrategy({ fail: true }));
      passport.use('single-use-token', new MockSingleUseTokenStrategy({ fail: true }));
      return passport.authenticate(['local', 'single-use-token'], { failureFlash: true, failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        req.flash = function(type, msg) {
          this.message = { type: type, msg: msg }
        }
        var res = new MockResponse();
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set first flash on request' : function(err, req, res) {
        assert.equal(req.message.type, 'error');
        assert.equal(req.message.msg, 'Bad username or password');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a multiple API strategies failing with default status': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('basic', new MockBasicStrategy({ fail: true }));
      passport.use('digest', new MockDigestStrategy({ fail: true }));
      passport.use('nc', new MockNoChallengeStrategy({ fail: true }));
      return passport.authenticate(['basic', 'nc', 'digest'], { session: false });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.end = function() {
          self.callback(null, req, res)
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set status code to unauthorized' : function(err, req, res) {
        assert.equal(res.statusCode, 401);
      },
      'should set multiple WWW-Authenticate headers' : function(err, req, res) {
        assert.lengthOf(res._headers['WWW-Authenticate'], 2);
        assert.equal(res._headers['WWW-Authenticate'][0], 'Basic foo');
        assert.equal(res._headers['WWW-Authenticate'][1], 'Digest foo');
      },
    },
  },
  
  'with a multiple API strategies failing with different status': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('basic', new MockBasicStrategy({ fail: true, statusCode: 400 }));
      passport.use('digest', new MockDigestStrategy({ fail: true, statusCode: 403 }));
      passport.use('nc', new MockNoChallengeStrategy({ fail: true, statusCode: 402 }));
      return passport.authenticate(['basic', 'nc', 'digest'], { session: false });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.end = function() {
          self.callback(null, req, res)
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set status code to bad request' : function(err, req, res) {
        assert.equal(res.statusCode, 400);
      },
      'should set multiple WWW-Authenticate headers' : function(err, req, res) {
        assert.lengthOf(res._headers['WWW-Authenticate'], 2);
        assert.equal(res._headers['WWW-Authenticate'][0], 'Basic foo');
        assert.equal(res._headers['WWW-Authenticate'][1], 'Digest foo');
      },
    },
  },
  
  'with a single API strategy failing with challenge and status using custom callback': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('basic', new MockBasicStrategy({ fail: true, statusCode: 400 }));
      var callback = function(err, user, challenge, status) {
        this.done(err, user, challenge, status);
      }
      var context = {};
      
      var authenticate = passport.authenticate('basic', callback.bind(context));
      process.nextTick(function () {
        self.callback(null, authenticate, context);
      });
    },
    
    'when handling a request': {
      topic: function(authenticate, context) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        context.done = function(err, user, challenge, status) {
          self.callback(err, req, res, user, challenge, status);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res, user, challenge, status) {
        assert.isUndefined(req.user);
      },
      'should pass user to callback as false' : function(err, req, res, user, challenge, status) {
        assert.isFalse(user);
      },
      'should pass challenge to callback' : function(err, req, res, user, challenge, status) {
        assert.strictEqual(challenge, 'Basic foo');
      },
      'should pass status to callback' : function(err, req, res, user, challenge, status) {
        assert.strictEqual(status, 400);
      },
    },
  },
  
  'with a multiple API strategies failing with default status using custom callback': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('basic', new MockBasicStrategy({ fail: true }));
      passport.use('digest', new MockDigestStrategy({ fail: true }));
      passport.use('nc', new MockNoChallengeStrategy({ fail: true }));
      var callback = function(err, user, challenge, status) {
        this.done(err, user, challenge, status);
      }
      var context = {};
      
      var authenticate = passport.authenticate(['basic', 'nc', 'digest'], callback.bind(context));
      process.nextTick(function () {
        self.callback(null, authenticate, context);
      });
    },
    
    'when handling a request': {
      topic: function(authenticate, context) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        context.done = function(err, user, challenge, status) {
          self.callback(err, req, res, user, challenge, status);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res, user, challenge, status) {
        assert.isUndefined(req.user);
      },
      'should pass user to callback as false' : function(err, req, res, user, challenge, status) {
        assert.isFalse(user);
      },
      'should pass challenges callback' : function(err, req, res, user, challenge, status) {
        assert.isArray(challenge);
        assert.lengthOf(challenge, 3);
        assert.equal(challenge[0], 'Basic foo');
        assert.isUndefined(challenge[1]);
        assert.equal(challenge[2], 'Digest foo');
      },
      'should pass statuses callback' : function(err, req, res, user, challenge, status) {
        assert.isArray(status);
        assert.lengthOf(status, 3);
        assert.isUndefined(status[0]);
        assert.isUndefined(status[1]);
        assert.isUndefined(status[2]);
      },
    },
  },
  
  'with a multiple API strategies failing with different status using custom callback': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('basic', new MockBasicStrategy({ fail: true, statusCode: 400 }));
      passport.use('digest', new MockDigestStrategy({ fail: true, statusCode: 403 }));
      passport.use('nc', new MockNoChallengeStrategy({ fail: true, statusCode: 402 }));
      var callback = function(err, user, challenge, status) {
        this.done(err, user, challenge, status);
      }
      var context = {};
      
      var authenticate = passport.authenticate(['basic', 'nc', 'digest'], callback.bind(context));
      process.nextTick(function () {
        self.callback(null, authenticate, context);
      });
    },
    
    'when handling a request': {
      topic: function(authenticate, context) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        context.done = function(err, user, challenge, status) {
          self.callback(err, req, res, user, challenge, status);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res, user, challenge, status) {
        assert.isUndefined(req.user);
      },
      'should pass user to callback as false' : function(err, req, res, user, challenge, status) {
        assert.isFalse(user);
      },
      'should pass challenges callback' : function(err, req, res, user, challenge, status) {
        assert.isArray(challenge);
        assert.lengthOf(challenge, 3);
        assert.equal(challenge[0], 'Basic foo');
        assert.equal(challenge[1], 402);
        assert.equal(challenge[2], 'Digest foo');
      },
      'should pass statuses callback' : function(err, req, res, user, challenge, status) {
        assert.isArray(status);
        assert.lengthOf(status, 3);
        assert.equal(status[0], 400);
        assert.isUndefined(status[1]);
        assert.equal(status[2], 403);
      },
    },
  },
  
}).export(module);
