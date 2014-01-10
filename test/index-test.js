var vows = require('vows');
var assert = require('assert');
var passport = require('passport');
var util = require('util');
var Passport = require('passport').Passport;


vows.describe('passport').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(passport.version);
    },
  },
  
  'passport': {
    topic: function() {
      return new Passport();
    },
    
    'should create initialization middleware': function (passport) {
      var initialize = passport.initialize();
      assert.isFunction(initialize);
      assert.lengthOf(initialize, 3);
    },
    'should create session restoration middleware': function (passport) {
      var session = passport.session();
      assert.isFunction(session);
      assert.lengthOf(session, 3);
    },
    'should create authentication middleware': function (passport) {
      var authenticate = passport.authenticate();
      assert.isFunction(authenticate);
      assert.lengthOf(authenticate, 3);
    },
  },
  
  // OK
  'passport with strategies': {
    topic: function() {
      return new Passport();
    },
    
    'should add strategies': function (passport) {
      var strategy = {};
      strategy.name = 'default';
      passport.use(strategy);
      
      assert.isObject(passport._strategies['default']);
      passport._strategies = {};
    },
    'should add strategies with specified name': function (passport) {
      var strategy = {};
      passport.use('foo', strategy);
      
      assert.isObject(passport._strategies['foo']);
      passport._strategies = {};
    },
    'should add strategies that have a name with overrride name': function (passport) {
      var strategy = {};
      strategy.name = 'foo';
      passport.use('my-foo', strategy);
      
      assert.isObject(passport._strategies['my-foo']);
      assert.isUndefined(passport._strategies['foo']);
      passport._strategies = {};
    },
    'should throw an error when adding strategies without a name' : function(passport) {
      var strategy = {};
      assert.throws(function() {
        passport.use(strategy);
      });
    },
  },
  
  // OK
  'passport with strategies to unuse': {
    topic: function() {
      return new Passport();
    },
    
    'should unuse strategies': function (passport) {
      var strategyOne = {};
      strategyOne.name = 'one';
      passport.use(strategyOne);
      var strategyTwo = {};
      strategyTwo.name = 'two';
      passport.use(strategyTwo);
      
      // session is implicitly used
      assert.lengthOf(Object.keys(passport._strategies), 3);
      assert.isObject(passport._strategies['one']);
      assert.isObject(passport._strategies['two']);
      
      passport.unuse('one');
      assert.lengthOf(Object.keys(passport._strategies), 2);
      assert.isUndefined(passport._strategies['one']);
      assert.isObject(passport._strategies['two']);
    },
  },
  
  // OK
  'passport with no serializers': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      function serialized(err, obj) {
        self.callback(err, obj);
      }
      process.nextTick(function () {
        passport.serializeUser({ id: '1', username: 'jared' }, serialized);
      });
    },
    
    'should fail to serialize user': function (err, obj) {
      assert.instanceOf(err, Error);
      assert.isUndefined(obj);
    },
  },
  
  // OK
  'passport with one serializer': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      function serialized(err, obj) {
        self.callback(err, obj);
      }
      process.nextTick(function () {
        passport.serializeUser({ id: '1', username: 'jared' }, serialized);
      });
    },
    
    'should serialize user': function (err, obj) {
      assert.isNull(err);
      assert.equal(obj, '1');
    },
  },
  
  // OK
  'passport with multiple serializers': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done('pass');
      });
      passport.serializeUser(function(user, done) {
        done(null, 'second-serializer');
      });
      passport.serializeUser(function(user, done) {
        done(null, 'should-not-execute');
      });
      function serialized(err, obj) {
        self.callback(err, obj);
      }
      process.nextTick(function () {
        passport.serializeUser({ id: '1', username: 'jared' }, serialized);
      });
    },
    
    'should serialize user': function (err, obj) {
      assert.isNull(err);
      assert.equal(obj, 'second-serializer');
    },
  },
  
  // OK
  'passport with one serializer that sets user to 0': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, 0);
      });
      function serialized(err, obj) {
        self.callback(err, obj);
      }
      process.nextTick(function () {
        passport.serializeUser({ id: '1', username: 'jared' }, serialized);
      });
    },
    
    'should serialize user': function (err, obj) {
      assert.isNull(err);
      assert.equal(obj, 0);
    },
  },
  
  // OK
  'passport with one serializer that sets user to null': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, null);
      });
      function serialized(err, obj) {
        self.callback(err, obj);
      }
      process.nextTick(function () {
        passport.serializeUser({ id: '1', username: 'jared' }, serialized);
      });
    },
    
    'should fail to serialize user': function (err, obj) {
      assert.instanceOf(err, Error);
      assert.isUndefined(obj);
    },
  },
  
  // OK
  'passport with one serializer that sets user to false': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, false);
      });
      function serialized(err, obj) {
        self.callback(err, obj);
      }
      process.nextTick(function () {
        passport.serializeUser({ id: '1', username: 'jared' }, serialized);
      });
    },
    
    'should fail to serialize user': function (err, obj) {
      assert.instanceOf(err, Error);
      assert.isUndefined(obj);
    },
  },
  
  // OK
  'passport with a serializer that throws an error': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        // throws ReferenceError: wtf is not defined
        wtf
      });
      function serialized(err, obj) {
        self.callback(err, obj);
      }
      process.nextTick(function () {
        passport.serializeUser({ id: '1', username: 'jared' }, serialized);
      });
    },
    
    'should fail to serialize user': function (err, obj) {
      assert.instanceOf(err, Error);
      assert.isUndefined(obj);
    },
  },
  
  'passport with no deserializers': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      function deserialized(err, user) {
        self.callback(err, user);
      }
      process.nextTick(function () {
        passport.deserializeUser({ id: '1', username: 'jared' }, deserialized);
      });
    },
    
    'should fail to deserialize user': function (err, user) {
      assert.instanceOf(err, Error);
      assert.isUndefined(user);
    },
  },
  
  'passport with one deserializer': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.deserializeUser(function(obj, done) {
        done(null, obj.username);
      });
      function deserialized(err, user) {
        self.callback(err, user);
      }
      process.nextTick(function () {
        passport.deserializeUser({ id: '1', username: 'jared' }, deserialized);
      });
    },
    
    'should deserialize user': function (err, user) {
      assert.isNull(err);
      assert.equal(user, 'jared');
    },
  },
  
  'passport with multiple deserializers': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.deserializeUser(function(obj, done) {
        done('pass');
      });
      passport.deserializeUser(function(obj, done) {
        done(null, 'second-deserializer');
      });
      passport.deserializeUser(function(obj, done) {
        done(null, 'should-not-execute');
      });
      function deserialized(err, user) {
        self.callback(err, user);
      }
      process.nextTick(function () {
        passport.deserializeUser({ id: '1', username: 'jared' }, deserialized);
      });
    },
    
    'should deserialize user': function (err, user) {
      assert.isNull(err);
      assert.equal(user, 'second-deserializer');
    },
  },
  
  'passport with one deserializer that sets user to null': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.deserializeUser(function(obj, done) {
        done(null, null);
      });
      function deserialized(err, user) {
        self.callback(err, user);
      }
      process.nextTick(function () {
        passport.deserializeUser({ id: '1', username: 'jared' }, deserialized);
      });
    },
    
    'should invalidate user': function (err, user) {
      assert.isNull(err);
      assert.strictEqual(user, false);
    },
  },
  
  'passport with one deserializer that sets user to false': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.deserializeUser(function(obj, done) {
        done(null, false);
      });
      function deserialized(err, user) {
        self.callback(err, user);
      }
      process.nextTick(function () {
        passport.deserializeUser({ id: '1', username: 'jared' }, deserialized);
      });
    },
    
    'should invalidate user': function (err, user) {
      assert.isNull(err);
      assert.strictEqual(user, false);
    },
  },
  
  'passport with multiple deserializers, the second of which sets user to null': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.deserializeUser(function(obj, done) {
        done('pass');
      });
      passport.deserializeUser(function(obj, done) {
        done(null, null);
      });
      passport.deserializeUser(function(obj, done) {
        done(null, 'should-not-execute');
      });
      function deserialized(err, user) {
        self.callback(err, user);
      }
      process.nextTick(function () {
        passport.deserializeUser({ id: '1', username: 'jared' }, deserialized);
      });
    },
    
    'should invalidate user': function (err, user) {
      assert.isNull(err);
      assert.strictEqual(user, false);
    },
  },
  
  'passport with multiple deserializers, the second of which sets user to false': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.deserializeUser(function(obj, done) {
        done('pass');
      });
      passport.deserializeUser(function(obj, done) {
        done(null, false);
      });
      passport.deserializeUser(function(obj, done) {
        done(null, 'should-not-execute');
      });
      function deserialized(err, user) {
        self.callback(err, user);
      }
      process.nextTick(function () {
        passport.deserializeUser({ id: '1', username: 'jared' }, deserialized);
      });
    },
    
    'should invalidate user': function (err, user) {
      assert.isNull(err);
      assert.strictEqual(user, false);
    },
  },
  
  'passport with a deserializer that throws an error': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.deserializeUser(function(obj, done) {
        // throws ReferenceError: wtf is not defined
        wtf
      });
      function deserialized(err, user) {
        self.callback(err, user);
      }
      process.nextTick(function () {
        passport.deserializeUser({ id: '1', username: 'jared' }, deserialized);
      });
    },
    
    'should fail to deserialize user': function (err, obj) {
      assert.instanceOf(err, Error);
      assert.isUndefined(obj);
    },
  },
  
  'passport with no auth info transformers': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      function transformed(err, obj) {
        self.callback(err, obj);
      }
      process.nextTick(function () {
        passport.transformAuthInfo({ clientId: '1', scope: 'write' }, transformed);
      });
    },
    
    'should leave info untransformed': function (err, obj) {
      assert.isNull(err);
      assert.equal(obj.clientId, '1');
      assert.equal(obj.scope, 'write');
    },
  },
  
  'passport with one auth info transformer': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.transformAuthInfo(function(info, done) {
        done(null, { clientId: info.clientId, client: { name: 'foo' }});
      });
      function transformed(err, obj) {
        self.callback(err, obj);
      }
      process.nextTick(function () {
        passport.transformAuthInfo({ clientId: '1', scope: 'write' }, transformed);
      });
    },
    
    'should transform info': function (err, obj) {
      assert.isNull(err);
      assert.equal(obj.clientId, '1');
      assert.equal(obj.client.name, 'foo');
      assert.isUndefined(obj.scope);
    },
  },
  
  'passport with multiple auth info transformers': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.transformAuthInfo(function(info, done) {
        done('pass');
      });
      passport.transformAuthInfo(function(info, done) {
        done(null, { clientId: info.clientId, client: { name: 'bar' }});
      });
      passport.transformAuthInfo(function(info, done) {
        done(null, { clientId: info.clientId, client: { name: 'not-bar' }});
      });
      function transformed(err, obj) {
        self.callback(err, obj);
      }
      process.nextTick(function () {
        passport.transformAuthInfo({ clientId: '1', scope: 'write' }, transformed);
      });
    },
    
    'should transform info': function (err, obj) {
      assert.isNull(err);
      assert.equal(obj.clientId, '1');
      assert.equal(obj.client.name, 'bar');
      assert.isUndefined(obj.scope);
    },
  },
  
  'passport with an auth info transformer that throws an error': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.transformAuthInfo(function(user, done) {
        // throws ReferenceError: wtf is not defined
        wtf
      });
      function transformed(err, obj) {
        self.callback(err, obj);
      }
      process.nextTick(function () {
        passport.serializeUser({ clientId: '1', scope: 'write' }, transformed);
      });
    },
    
    'should fail to transform info': function (err, obj) {
      assert.instanceOf(err, Error);
      assert.isUndefined(obj);
    },
  },

}).export(module);
