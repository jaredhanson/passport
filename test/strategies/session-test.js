var vows = require('vows');
var assert = require('assert');
var util = require('util');
var SessionStrategy = require('passport/strategies/session');


vows.describe('SessionStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new SessionStrategy();
    },
    
    'should be named session': function (strategy) {
      assert.equal(strategy.name, 'session');
    },
  },
  
  'strategy handling a request without a login session': {
    topic: function() {
      return new SessionStrategy();
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        strategy.pass = function() {
          self.callback(null, req);
        }
        strategy.error = function(err) {
          self.callback(err, req);
        }
        
        req._passport = {};
        req._passport.session = {};
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not generate an error' : function(err, req) {
        assert.isNull(err);
      },
      'should not set a user on the request' : function(err, req) {
        assert.isUndefined(req.user);
      },
    },
  },
  
  'strategy handling a request with a login session': {
    topic: function() {
      return new SessionStrategy();
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        strategy.pass = function() {
          self.callback(null, req);
        }
        strategy.error = function(err) {
          self.callback(err, req);
        }
        
        req._passport = {};
        req._passport.instance = {};
        req._passport.instance.deserializeUser = function(user, done) {
          done(null, { id: user });
        }
        req._passport.session = {};
        req._passport.session.user = '123456';
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not generate an error' : function(err, req) {
        assert.isNull(err);
      },
      'should set a user on the request' : function(err, req) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '123456');
      },
    },
  },
  
  'strategy handling a request with a login session but badly behaving user deserializer': {
    topic: function() {
      return new SessionStrategy();
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        strategy.pass = function() {
          self.callback(null, req);
        }
        strategy.error = function(err) {
          self.callback(err, req);
        }
        
        req._passport = {};
        req._passport.instance = {};
        req._passport.instance.deserializeUser = function(user, done) {
          done(new Error('failed to deserialize'));
        }
        req._passport.session = {};
        req._passport.session.user = '123456';
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should generate an error' : function(err, req) {
        assert.instanceOf(err, Error);
      },
      'should not set a user on the request' : function(err, req) {
        assert.isUndefined(req.user);
      },
    },
  },
  
  'strategy handling a request without an initialized passport': {
    topic: function() {
      return new SessionStrategy();
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        strategy.error = function(err) {
          self.callback(err, req);
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should generate an error' : function(err, req) {
        assert.instanceOf(err, Error);
      },
      'should not set a user on the request' : function(err, req) {
        assert.isUndefined(req.user);
      },
    },
  },

}).export(module);
