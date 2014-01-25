/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , SessionStrategy = require('../../lib/strategies/session');


describe('SessionStrategy', function() {
  
  var strategy = new SessionStrategy();
  
  it('should be named session', function() {
    expect(strategy.name).to.equal('session');
  });
  
  describe('handling a request without a login session', function() {
    var request, pass = false;
  
    before(function(done) {
      chai.passport.use(strategy)
        .pass(function() {
          pass = true;
          done();
        })
        .req(function(req) {
          request = req;
          
          req._passport = {};
          req._passport.session = {};
        })
        .authenticate();
    });
  
    it('should pass', function() {
      expect(pass).to.be.true;
    });
    
    it('should not set user on request', function() {
      expect(request.user).to.be.undefined;
    });
  });
  
  describe('handling a request with a login session', function() {
    var request, pass = false;
  
    before(function(done) {
      chai.passport.use(strategy)
        .pass(function() {
          pass = true;
          done();
        })
        .req(function(req) {
          request = req;
          
          req._passport = {};
          req._passport.instance = {};
          req._passport.instance.deserializeUser = function(user, req, done) {
            done(null, { id: user });
          };
          req._passport.session = {};
          req._passport.session.user = '123456';
        })
        .authenticate();
    });
  
    it('should pass', function() {
      expect(pass).to.be.true;
    });
    
    it('should set user on request', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.id).to.equal('123456');
    });
    
    it('should maintain session', function() {
      expect(request._passport.session).to.be.an('object');
      expect(request._passport.session.user).to.equal('123456');
    });
  });
  
  describe('handling a request with a login session serialized to 0', function() {
    var request, pass = false;
  
    before(function(done) {
      chai.passport.use(strategy)
        .pass(function() {
          pass = true;
          done();
        })
        .req(function(req) {
          request = req;
          
          req._passport = {};
          req._passport.instance = {};
          req._passport.instance.deserializeUser = function(user, req, done) {
            done(null, { id: user });
          };
          req._passport.session = {};
          req._passport.session.user = 0;
        })
        .authenticate();
    });
  
    it('should pass', function() {
      expect(pass).to.be.true;
    });
    
    it('should set user on request', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.id).to.equal(0);
    });
    
    it('should maintain session', function() {
      expect(request._passport.session).to.be.an('object');
      expect(request._passport.session.user).to.equal(0);
    });
  });
  
  describe('handling a request with a login session that has been invalidated', function() {
    var request, pass = false;
  
    before(function(done) {
      chai.passport.use(strategy)
        .pass(function() {
          pass = true;
          done();
        })
        .req(function(req) {
          request = req;
          
          req._passport = {};
          req._passport.instance = {};
          req._passport.instance.deserializeUser = function(user, req, done) {
            done(null, false);
          };
          req._passport.session = {};
          req._passport.session.user = '123456';
        })
        .authenticate();
    });
  
    it('should pass', function() {
      expect(pass).to.be.true;
    });
    
    it('should not set user on request', function() {
      expect(request.user).to.be.undefined;
    });
    
    it('should remove user from session', function() {
      expect(request._passport.session).to.be.an('object');
      expect(request._passport.session.user).to.be.undefined;
    });
  });
  
  describe('handling a request with a login session and setting custom user property', function() {
    var request, pass = false;
  
    before(function(done) {
      chai.passport.use(strategy)
        .pass(function() {
          pass = true;
          done();
        })
        .req(function(req) {
          request = req;
          
          req._passport = {};
          req._passport.instance = {};
          req._passport.instance._userProperty = 'currentUser';
          req._passport.instance.deserializeUser = function(user, req, done) {
            done(null, { id: user });
          };
          req._passport.session = {};
          req._passport.session.user = '123456';
        })
        .authenticate();
    });
  
    it('should pass', function() {
      expect(pass).to.be.true;
    });
    
    it('should not set "user" on request', function() {
      expect(request.user).to.be.undefined;
    });
    
    it('should set "currentUser" on request', function() {
      expect(request.currentUser).to.be.an('object');
      expect(request.currentUser.id).to.equal('123456');
    });
  });
  
  describe('handling a request with a login session that encounters an error when deserializing', function() {
    var request, error;
  
    before(function(done) {
      chai.passport.use(strategy)
        .error(function(err) {
          error = err;
          done();
        })
        .req(function(req) {
          request = req;
          
          req._passport = {};
          req._passport.instance = {};
          req._passport.instance.deserializeUser = function(user, req, done) {
            done(new Error('something went wrong'));
          };
          req._passport.session = {};
          req._passport.session.user = '123456';
        })
        .authenticate();
    });
  
    it('should error', function() {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('something went wrong');
    });
    
    it('should not set user on request', function() {
      expect(request.user).to.be.undefined;
    });
    
    it('should maintain session', function() {
      expect(request._passport.session).to.be.an('object');
      expect(request._passport.session.user).to.equal('123456');
    });
  });
  
  describe('handling a request that lacks an authenticator', function() {
    var request, error;
  
    before(function(done) {
      chai.passport.use(strategy)
        .error(function(err) {
          error = err;
          done();
        })
        .req(function(req) {
          request = req;
        })
        .authenticate();
    });
  
    it('should error', function() {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('passport.initialize() middleware not in use');
    });
    
    it('should not set user on request', function() {
      expect(request.user).to.be.undefined;
    });
  });
  
});
