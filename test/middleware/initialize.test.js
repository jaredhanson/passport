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
      expect(request._passport.instance._sm).to.be.an('object');
      expect(request._passport.instance._userProperty).to.equal('user');
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
      expect(request._passport.instance._sm).to.be.an('object');
      expect(request._passport.instance._userProperty).to.equal('user');
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
      expect(request._passport.instance._sm).to.be.an('object');
      expect(request._passport.instance._userProperty).to.equal('user');
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
      expect(request._passport.instance._sm).to.be.an('object');
      expect(request._passport.instance._userProperty).to.equal('user');
    });
  });
  
  describe('handling a request with a new session without compat mode', function() {
    var passport = new Passport();
    var request, error;

    before(function(done) {
      chai.connect.use(initialize(passport, { compat: false }))
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
      expect(request._passport).to.be.undefined;
    });
  });
  
});
