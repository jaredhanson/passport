var vows = require('vows');
var assert = require('assert');
var passport = require('passport');
var util = require('util');
var Passport = require('passport').Passport;


vows.describe('initialize').addBatch({
  
  'middleware': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.deserializeUser(function(obj, done) {
        done(null, { id: obj });
      });
      return passport.initialize();
    },
    
    // OK
    'when handling a request without a session': {
      topic: function(initialize) {
        var self = this;
        var req = {};
        var res = {}
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          initialize(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set internal passport on the request' : function(err, req, res) {
        assert.isObject(req._passport);
        assert.instanceOf(req._passport.instance, Passport);
        assert.isObject(req._passport.session);
      },
    },
    
    'when handling a request with a session': {
      topic: function(initialize) {
        var self = this;
        var req = {};
        req.session = {};
        var res = {}
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          initialize(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should initialize a passport within the session' : function(err, req, res) {
        assert.isObject(req.session.passport);
      },
      'should set internal passport on the request' : function(err, req, res) {
        assert.isObject(req._passport);
        assert.instanceOf(req._passport.instance, Passport);
        assert.isObject(req._passport.session);
      },
    },
    
    'when handling a request with a session containing passport data': {
      topic: function(initialize) {
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
          initialize(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should maintain passport within the session' : function(err, req, res) {
        assert.isObject(req.session.passport);
        assert.isString(req.session.passport.user);
      },
      'should set internal passport on the request' : function(err, req, res) {
        assert.isObject(req._passport);
        assert.instanceOf(req._passport.instance, Passport);
        assert.isObject(req._passport.session);
      },
    },
  },
  
}).export(module);
