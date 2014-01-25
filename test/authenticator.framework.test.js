/* global describe, it, expect */

var Authenticator = require('../lib/authenticator');


describe('Authenticator', function() {
  
  describe('#framework', function() {
    
    describe('with an authenticate function used for authorization', function() {
      var passport = new Authenticator();
      passport.framework({
        initialize: function() {
          return function() {};
        },
        authenticate: function(passport, name, options) {
          return function() {
            return 'authenticate(): ' + name + ' ' + options.assignProperty;
          };
        }
      });
      
      var rv = passport.authorize('foo')();
      it('should call authenticate', function() {
        expect(rv).to.equal('authenticate(): foo account');
      });
    });
    
    describe('with an authorize function used for authorization', function() {
      var passport = new Authenticator();
      passport.framework({
        initialize: function() {
          return function() {};
        },
        authenticate: function(passport, name, options) {
          return function() {
            return 'authenticate(): ' + name + ' ' + options.assignProperty;
          };
        },
        authorize: function(passport, name, options) {
          return function() {
            return 'authorize(): ' + name + ' ' + options.assignProperty;
          };
        }
      });
      
      var rv = passport.authorize('foo')();
      it('should call authorize', function() {
        expect(rv).to.equal('authorize(): foo account');
      });
    });
    
  });
  
});
