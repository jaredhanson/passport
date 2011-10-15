var vows = require('vows');
var assert = require('assert');
var http = require('http')
var util = require('util');
require('passport/http/request');


vows.describe('HttpServerRequest').addBatch({
  
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
  
  'request without a null user': {
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

}).export(module);
