/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , authenticate = require('../../lib/middleware/authenticate')
  , Passport = require('../..').Passport;


describe('middleware/authenticate', function() {
  
  describe('pass', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req) {
      this.pass();
    };
    
    var passport = new Passport();
    passport.use('pass', new Strategy());
    
    var request, error;

    before(function(done) {
      chai.connect.use(authenticate(passport, 'pass'))
        .req(function(req) {
          request = req;
        })
        .next(function(err) {
          error = err;
          done();
        })
        .dispatch();
    });
    
    it('should not error', function() {
      expect(error).to.be.undefined;
    });
    
    it('should not set user', function() {
      expect(request.user).to.be.undefined;
    });
  });
  
});
