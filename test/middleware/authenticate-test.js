var vows = require('vows');
var assert = require('assert');
var passport = require('passport');
var util = require('util');
var Passport = require('passport').Passport;


function MockSuccessStrategy() {
}

MockSuccessStrategy.prototype.authenticate = function(req) {
  this.success({ id: '1', username: 'jaredhanson' });
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
}


vows.describe('authenticate').addBatch({
  
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
    },
  },
  
  'with a successful authentication but failed request login': {
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
    },
  },
  
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
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  'with a successful authentication and callback': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      var callback = function(err, user) {
        this.done(err, user);
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
        context.done = function(err, user) {
          self.callback(err, user);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, user) {
        assert.isNull(err);
      },
      'should pass user to callback' : function(err, user) {
        assert.isObject(user);
        assert.equal(user.id, '1');
        assert.equal(user.username, 'jaredhanson');
      },
    },
  },
  
}).export(module);
