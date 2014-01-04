var vows = require('vows');
var assert = require('assert');
var util = require('util');
var SessionStrategy = require('passport/strategies/session');


vows.describe('SessionStrategy').addBatch({
  
  // OK
  'strategy': {
    topic: function() {
      return new SessionStrategy();
    },
    
    'should be named session': function (strategy) {
      assert.equal(strategy.name, 'session');
    },
  },
  
  // OK
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
  
  // OK
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
      'should maintain the session' : function(err, req) {
        assert.isObject(req._passport.session);
        assert.equal(req._passport.session.user, '123456');
      },
    },
  },
  
  // OK
  'strategy handling a request with a login session using user ID 0': {
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
        req._passport.session.user = 0;
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not generate an error' : function(err, req) {
        assert.isNull(err);
      },
      'should set a user on the request' : function(err, req) {
        assert.isObject(req.user);
        assert.equal(req.user.id, 0);
      },
      'should maintain the session' : function(err, req) {
        assert.isObject(req._passport.session);
        assert.equal(req._passport.session.user, 0);
      },
    },
  },
  
  // OK
  'strategy handling a request with a login session that has been invalidated': {
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
          done(null, false);
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
      'should not set a user on the request' : function(err, req) {
        assert.isUndefined(req.user);
      },
      'should remove user from the session' : function(err, req) {
        assert.isObject(req._passport.session);
        assert.isUndefined(req._passport.session.user);
      },
    },
  },
  
  // OK
  'strategy handling a login session with a custom user property': {
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
        req._passport.instance._userProperty = 'currentUser';
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
      'should not set a property called "user" on the request': function(err, req) {
        assert.isUndefined(req.user);
      },
      'should set a a property called "currentUser" on the request' : function(err, req) {
        assert.isObject(req.currentUser);
        assert.equal(req.currentUser.id, '123456');
      },
    },
  },

  // OK
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
  
  // OK
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
