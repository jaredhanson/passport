/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , initialize = require('../../lib/middleware/initialize')
  , Passport = require('../..').Passport;


describe('middleware/initialize', function() {
  
  it('should be named initialize', function() {
    expect(initialize().name).to.equal('initialize');
  });
  
  describe('handling a request without a session', function() {
    var passport = new Passport();
    var request, error;

    before(function(done) {
      chai.connect.use(initialize(passport))
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
    
    it('should expose authenticator on internal request property', function() {
      expect(request._passport).to.be.an('object');
      expect(request._passport.instance).to.be.an.instanceOf(Passport);
      expect(request._passport.instance).to.equal(passport);
    });
    
    it('should not expose empty object as session storage on internal request property', function() {
      expect(request._passport.session).to.be.undefined;
    });
  });
  
  describe('handling a request with a new session', function() {
    var passport = new Passport();
    var request, error;

    before(function(done) {
      chai.connect.use(initialize(passport))
        .req(function(req) {
          request = req;
          
          req.session = {};
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
    
    it('should not initialize namespace within session', function() {
      expect(request.session.passport).to.be.undefined;
    });
    
    it('should expose authenticator on internal request property', function() {
      expect(request._passport).to.be.an('object');
      expect(request._passport.instance).to.be.an.instanceOf(Passport);
      expect(request._passport.instance).to.equal(passport);
    });
    
    it('should not expose session storage on internal request property', function() {
      expect(request._passport.session).to.be.undefined;
    });
  });
  
  describe('handling a request with an existing session', function() {
    var passport = new Passport();
    var request, error;

    before(function(done) {
      chai.connect.use(initialize(passport))
        .req(function(req) {
          request = req;
          
          req.session = {};
          req.session.passport = {};
          req.session.passport.user = '123456';
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
    
    it('should maintain data within session', function() {
      expect(request.session.passport).to.be.an('object');
      expect(Object.keys(request.session.passport)).to.have.length(1);
      expect(request.session.passport.user).to.equal('123456');
    });
    
    it('should expose authenticator on internal request property', function() {
      expect(request._passport).to.be.an('object');
      expect(request._passport.instance).to.be.an.instanceOf(Passport);
      expect(request._passport.instance).to.equal(passport);
    });
    
    it('should expose session storage on internal request property', function() {
      expect(request._passport.session).to.be.an('object');
      expect(Object.keys(request._passport.session)).to.have.length(1);
      expect(request._passport.session.user).to.equal('123456');
    });
  });
  
  describe('handling a request with an existing session using custom session key', function() {
    var passport = new Passport();
    passport._key = 'authentication';
    var request, error;

    before(function(done) {
      chai.connect.use(initialize(passport))
        .req(function(req) {
          request = req;
          
          req.session = {};
          req.session.authentication = {};
          req.session.authentication.user = '123456';
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
    
    it('should maintain data within session', function() {
      expect(request.session.authentication).to.be.an('object');
      expect(Object.keys(request.session.authentication)).to.have.length(1);
      expect(request.session.authentication.user).to.equal('123456');
    });
    
    it('should expose authenticator on internal request property', function() {
      expect(request._passport).to.be.an('object');
      expect(request._passport.instance).to.be.an.instanceOf(Passport);
      expect(request._passport.instance).to.equal(passport);
    });
    
    it('should expose session storage on internal request property', function() {
      expect(request._passport.session).to.be.an('object');
      expect(Object.keys(request._passport.session)).to.have.length(1);
      expect(request._passport.session.user).to.equal('123456');
    });
  });
  
});
