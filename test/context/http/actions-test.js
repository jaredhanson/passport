var vows = require('vows');
var assert = require('assert');
var util = require('util');
var actions = require('passport/context/http/actions');


vows.describe('actions').addBatch({
  
  'success': {
    topic: function() {
      var self = this;
      var context = {};
      context.delegate = {};
      context.delegate.success = function(user, extra) {
        self.callback(null, user, extra);
      }
      
      var success = actions.success.bind(context);
      process.nextTick(function () {
        success({ id: '1', username: 'jaredhanson' }, { location: 'Oakland, CA' });
      });
    },
    
    'should forward function call to delegate': function (err, user, extra) {
      assert.equal(user.id, '1');
      assert.equal(user.username, 'jaredhanson');
      assert.equal(extra.location, 'Oakland, CA');
    },
  },
  
  'fail': {
    topic: function() {
      var self = this;
      var context = {};
      context.delegate = {};
      context.delegate.fail = function(a) {
        self.callback(null, a);
      }
      
      var fail = actions.fail.bind(context);
      process.nextTick(function () {
        fail('Basic realm="Users"');
      });
    },
    
    'should forward function call to delegate without header argument': function (err, a) {
      assert.isUndefined(a);
    },
  },
  
  'redirect': {
    topic: function() {
      var self = this;
      var mockRes = {};
      mockRes.setHeader = function(field, value) {
        this.header = field + ': ' + value;
      }
      mockRes.end = function() {
        self.callback(null, this);
      }
      
      var context = {};
      context.res = mockRes;
      
      var redirect = actions.redirect.bind(context);
      process.nextTick(function () {
        redirect('http://www.example.com/login');
      });
    },
    
    'should redirect to url': function (err, res) {
      assert.equal(res.statusCode, 302);
      assert.equal(res.header, 'Location: http://www.example.com/login');
    },
  },
  
  'redirect with status code': {
    topic: function() {
      var self = this;
      var mockRes = {};
      mockRes.setHeader = function(field, value) {
        this.header = field + ': ' + value;
      }
      mockRes.end = function() {
        self.callback(null, this);
      }
      
      var context = {};
      context.res = mockRes;
      
      var redirect = actions.redirect.bind(context);
      process.nextTick(function () {
        redirect('http://www.example.com/login', 303);
      });
    },
    
    'should redirect to url': function (err, res) {
      assert.equal(res.statusCode, 303);
      assert.equal(res.header, 'Location: http://www.example.com/login');
    },
  },
  
  'pass': {
    topic: function() {
      var self = this;
      var context = {};
      context.next = function() {
        self.callback(null);
      }
      
      var pass = actions.pass.bind(context);
      process.nextTick(function () {
        pass();
      });
    },
    
    'should call next': function (err, ok) {
      assert.isTrue(true);
    },
  },
  
  'error': {
    topic: function() {
      var self = this;
      var context = {};
      context.next = function(err) {
        self.callback(null, err);
      }
      
      var error = actions.error.bind(context);
      process.nextTick(function () {
        error(new Error('something is wrong'));
      });
    },
    
    'should call next with an error': function (err, e) {
      assert.instanceOf(e, Error);
      assert.equal(e.message, 'something is wrong');
    },
  },

}).export(module);
