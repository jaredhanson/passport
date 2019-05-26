/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , authenticateWith = require('../../lib/middleware/authenticateWith')
  , Passport = require('../..').Passport;


describe('middleware/authenticateWith', function() {

  it('should be named authenticateWith', function() {
    expect(authenticateWith().name).to.equal('authenticateWith');
  });

  describe('without configurator', function() {
    var passport = new Passport();

    var request, error;

    before(function(done) {
      chai.connect.use(authenticateWith(passport))
        .req(function(req) {
          request = req;
        })
        .end(function(res) {
          response = res;
          done();
        })
        .dispatch();
    });

    it('should not set user', function() {
      expect(request.user).to.be.undefined;
    });

    it('should respond', function() {
      expect(response.statusCode).to.equal(401);
      expect(response.getHeader('WWW-Authenticate')).to.be.undefined;
      expect(response.body).to.equal('Unauthorized');
    });
  });

  describe('returning unknown strategy', function() {
    var passport = new Passport();

    var request, error;

    function configurator(req, done) {
      return done(null, 'foo');
    }

    before(function(done) {
      chai.connect.use(authenticateWith(passport, configurator))
        .req(function(req) {
          request = req;

          req.logIn = function(user, options, done) {
            this.user = user;
            done();
          };
        })
        .next(function(err) {
          error = err;
          done();
        })
        .dispatch();
    });

    it('should error', function() {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('Unknown authentication strategy "foo"');
    });

    it('should not set user', function() {
      expect(request.user).to.be.undefined;
    });

    it('should not set authInfo', function() {
      expect(request.authInfo).to.be.undefined;
    });
  });

});
