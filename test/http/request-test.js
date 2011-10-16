var vows = require('vows');
var assert = require('assert');
var http = require('http')
var util = require('util');
require('passport/http/request');


vows.describe('HttpServerRequest').addBatch({
  
  'request': {
    topic: function() {
      return new http.IncomingMessage();
    },
    
    'logIn should be aliased to login': function (req) {
      assert.strictEqual(req.logIn, req.login);
    },
    'logOut should be aliased to logout': function (req) {
      assert.strictEqual(req.logOut, req.logout);
    },
  },
  
  'request to login with a session': {
    topic: function() {
      var self = this;
      var req = new http.IncomingMessage();
      var user = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = {};
      req._passport.session = {};
      req._passport.instance.serializeUser = function(user, done) {
        done(null, user.id);
      }
      
      function logIn() {
        req.logIn(user, function(err) {
          self.callback(err, req);
        })
      }
      process.nextTick(function () {
        logIn();
      });
    },
    
    'should not generate an error' : function(err, req) {
      assert.isNull(err);
    },
    'should be authenticated': function (err, req) {
      assert.isTrue(req.isAuthenticated());
    },
    'user property should be available': function (err, req) {
      assert.isObject(req.user);
      assert.equal(req.user.id, '1');
      assert.equal(req.user.username, 'root');
    },
    'session user data should be set': function (err, req) {
      assert.equal(req._passport.session.user, '1');
    },
  },
  
  'request to login with a session but a badly behaving user serializer': {
    topic: function() {
      var self = this;
      var req = new http.IncomingMessage();
      var user = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = {};
      req._passport.session = {};
      req._passport.instance.serializeUser = function(user, done) {
        done(new Error('failed to serialize'));
      }
      
      function logIn() {
        req.logIn(user, function(err) {
          self.callback(err, req);
        })
      }
      process.nextTick(function () {
        logIn();
      });
    },
    
    'should generate an error' : function(err, req) {
      assert.instanceOf(err, Error);
    },
    'should not be authenticated': function (err, req) {
      assert.isFalse(req.isAuthenticated());
    },
    'user property should not be available': function (err, req) {
      assert.isNull(req.user);
    },
    'session user data should not be set': function (err, req) {
      assert.isUndefined(req._passport.session.user);
    },
  },
  
  'request to login without a session': {
    topic: function() {
      var self = this;
      var req = new http.IncomingMessage();
      var user = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = {};
      req._passport.session = {};
      
      function logIn() {
        req.logIn(user, { session: false }, function(err) {
          self.callback(err, req);
        })
      }
      process.nextTick(function () {
        logIn();
      });
    },
    
    'should not generate an error' : function(err, req) {
      assert.isNull(err);
    },
    'should be authenticated': function (err, req) {
      assert.isTrue(req.isAuthenticated());
    },
    'user property should be available': function (err, req) {
      assert.isObject(req.user);
      assert.equal(req.user.id, '1');
      assert.equal(req.user.username, 'root');
    },
    'session user data should not be set': function (err, req) {
      assert.isUndefined(req._passport.session.user);
    },
  },
  
  'request to login without a session and no callback': {
    topic: function() {
      var self = this;
      var req = new http.IncomingMessage();
      var user = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = {};
      req._passport.session = {};
      
      function logIn() {
        req.logIn(user, { session: false });
        self.callback(null, req);
      }
      process.nextTick(function () {
        logIn();
      });
    },
    
    'should not generate an error' : function(err, req) {
      assert.isNull(err);
    },
    'should be authenticated': function (err, req) {
      assert.isTrue(req.isAuthenticated());
    },
    'user property should be available': function (err, req) {
      assert.isObject(req.user);
      assert.equal(req.user.id, '1');
      assert.equal(req.user.username, 'root');
    },
    'session user data should not be set': function (err, req) {
      assert.isUndefined(req._passport.session.user);
    },
  },
  
  'request with a login session': {
    topic: function() {
      var req = new http.IncomingMessage();
      req.user = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.session = {};
      req._passport.session.user = '1';
      return req;
    },
    
    'after being logged out': {
      topic: function(req) {
        req.logOut();
        return req;
      },
      
      'should not be authenticated': function (req) {
        assert.isFalse(req.isAuthenticated());
      },
      'user property should be null': function (req) {
        assert.isNull(req.user);
      },
      'session user data should be null': function (req) {
        assert.isUndefined(req._passport.session.user);
      },
    },
  },
  
  'request with a user': {
    topic: function() {
      var req = new http.IncomingMessage();
      req.user = { id: '1', username: 'root' };
      return req;
    },
    
    'should be authenticated': function (req) {
      assert.isFunction(req.isAuthenticated);
      assert.isTrue(req.isAuthenticated());
    },
    'should not be unauthenticated': function (req) {
      assert.isFunction(req.isUnauthenticated);
      assert.isFalse(req.isUnauthenticated());
    },
  },
  
  'request without a user': {
    topic: function() {
      var req = new http.IncomingMessage();
      return req;
    },
    
    'should not be authenticated': function (req) {
      assert.isFunction(req.isAuthenticated);
      assert.isFalse(req.isAuthenticated());
    },
    'should be unauthenticated': function (req) {
      assert.isFunction(req.isUnauthenticated);
      assert.isTrue(req.isUnauthenticated());
    },
  },
  
  'request with a null user': {
    topic: function() {
      var req = new http.IncomingMessage();
      req.user = null;
      return req;
    },
    
    'should not be authenticated': function (req) {
      assert.isFunction(req.isAuthenticated);
      assert.isFalse(req.isAuthenticated());
    },
    'should be unauthenticated': function (req) {
      assert.isFunction(req.isUnauthenticated);
      assert.isTrue(req.isUnauthenticated());
    },
  },
  
  'request without an internal passport instance': {
    topic: function() {
      return new http.IncomingMessage();
    },
    
    'should throw an error when attempting to login': function (req) {
      assert.throws(function() {
        req.logIn();
      });
    },
    'should throw an error when attempting to logout': function (req) {
      assert.throws(function() {
        req.logOut();
      });
    },
  },

}).export(module);
