var vows = require('vows');
var assert = require('assert');
var passport = require('passport');
var util = require('util');
var Passport = require('passport').Passport;


vows.describe('authentication').addBatch({
  
  'middleware': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.deserializeUser(function(obj, done) {
        done(null, { id: obj });
      });
      return passport.authentication();
    },
    
    'when handling a request without a session': {
      topic: function(authentication) {
        var self = this;
        var req = {};
        var res = {}
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authentication(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set a user on the request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set internal passport on the request' : function(err, req, res) {
        assert.isObject(req._passport);
      },
    },
    
    'when handling a request with a session but no user': {
      topic: function(authentication) {
        var self = this;
        var req = {};
        req.session = {};
        var res = {}
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authentication(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set a user on the request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should initialize a passport within the session' : function(err, req, res) {
        assert.isObject(req.session.passport);
      },
      'should set internal passport on the request' : function(err, req, res) {
        assert.isObject(req._passport);
      },
    },
    
    'when handling a request with a session and a user': {
      topic: function(authentication) {
        var self = this;
        var req = {};
        req.session = {};
        req.session.passport = {};
        req.session.passport.user = '123456'
        var res = {}
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authentication(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set a user on the request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '123456');
      },
      'should maintain passport within the session' : function(err, req, res) {
        assert.isObject(req.session.passport);
        assert.isString(req.session.passport.user);
      },
      'should set internal passport on the request' : function(err, req, res) {
        assert.isObject(req._passport);
      },
    },
  },
  
  'middleware with misbehaving deserializer': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.deserializeUser(function(obj, done) {
        done(new Error('something went wrong'));
      });
      return passport.authentication();
    },
    
    'when handling a request with a session and a user': {
      topic: function(authentication) {
        var self = this;
        var req = {};
        req.session = {};
        req.session.passport = {};
        req.session.passport.user = '123456'
        var res = {}
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authentication(req, res, next)
        });
      },
      
      'should generate an error' : function(err, req, res) {
        assert.instanceOf(err, Error);
      },
      'should not set a user on the request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should maintain passport within the session' : function(err, req, res) {
        assert.isObject(req.session.passport);
        assert.isString(req.session.passport.user);
      },
      'should set internal passport on the request' : function(err, req, res) {
        assert.isObject(req._passport);
      },
    },
  },
  
}).export(module);
