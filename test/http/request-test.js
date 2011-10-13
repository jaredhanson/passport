var vows = require('vows');
var assert = require('assert');
var http = require('http')
var util = require('util');
require('passport/http/request');


vows.describe('HttpServerRequest').addBatch({
  
  'request without a user': {
    topic: function() {
      var req = new http.IncomingMessage();
      req._passport = {};
      return req;
    },
    
    'should not be authenticated': function (req) {
      assert.isFunction(req.isAuthenticated);
      assert.isFalse(req.isAuthenticated());
    },
  },
  
  'request with a user': {
    topic: function() {
      var req = new http.IncomingMessage();
      req._passport = {};
      req._passport.user = { id: '1', username: 'root' }
      return req;
    },
    
    'should be authenticated': function (req) {
      assert.isFunction(req.isAuthenticated);
      assert.isTrue(req.isAuthenticated());
    },
  },

}).export(module);
