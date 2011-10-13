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

}).export(module);
