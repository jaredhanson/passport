/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , authenticate = require('../../lib/middleware/authenticate')
  , Passport = require('../..').Passport;


describe('middleware/authenticate', function() {
  
  describe('redirect', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req) {
      this.redirect('http://www.example.com/idp');
    };
    
    var passport = new Passport();
    passport.use('redirect', new Strategy());
    
    var request, response;

    before(function(done) {
      chai.connect.use(authenticate(passport, 'redirect'))
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
    
    it('should redirect', function() {
      expect(response.statusCode).to.equal(302);
      expect(response.getHeader('Location')).to.equal('http://www.example.com/idp');
      expect(response.getHeader('Content-Length')).to.equal('0');
    });
  });
  
  describe('redirect with status', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req) {
      this.redirect('http://www.example.com/idp', 303);
    };
    
    var passport = new Passport();
    passport.use('redirect', new Strategy());
    
    var request, response;

    before(function(done) {
      chai.connect.use(authenticate(passport, 'redirect'))
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
    
    it('should redirect', function() {
      expect(response.statusCode).to.equal(303);
      expect(response.getHeader('Location')).to.equal('http://www.example.com/idp');
      expect(response.getHeader('Content-Length')).to.equal('0');
    });
  });
  
  describe('redirect using framework function', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req) {
      this.redirect('http://www.example.com/idp');
    };
    
    var passport = new Passport();
    passport.use('redirect', new Strategy());
    
    var request, response;

    before(function(done) {
      chai.connect.use('express', authenticate(passport, 'redirect'))
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
    
    it('should redirect', function() {
      expect(response.statusCode).to.equal(302);
      expect(response.getHeader('Location')).to.equal('http://www.example.com/idp');
    });
  });
  
  describe('redirect with status using framework function', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req) {
      this.redirect('http://www.example.com/idp', 303);
    };
    
    var passport = new Passport();
    passport.use('redirect', new Strategy());
    
    var request, response;

    before(function(done) {
      chai.connect.use('express', authenticate(passport, 'redirect'))
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
    
    it('should redirect', function() {
      expect(response.statusCode).to.equal(303);
      expect(response.getHeader('Location')).to.equal('http://www.example.com/idp');
    });
  });
  
});
