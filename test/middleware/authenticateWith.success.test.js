/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , authenticateWith = require('../../lib/middleware/authenticateWith')
  , Passport = require('../..').Passport;

describe('middleware/authenticateWith', function() {

  describe('success returning strategy', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req) {
      var user = { id: '1', username: 'jaredhanson' };
      this.success(user);
    };

    var passport = new Passport();

    var request, error;

    function configurator(req, done) {
      return done(null, new Strategy());
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

    it('should not error', function() {
      expect(error).to.be.undefined;
    });

    it('should set user', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.id).to.equal('1');
      expect(request.user.username).to.equal('jaredhanson');
    });

    it('should set authInfo', function() {
      expect(request.authInfo).to.be.an('object');
      expect(Object.keys(request.authInfo)).to.have.length(0);
    });
  });

  describe('success returning name of strategy', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req) {
      var user = { id: '1', username: 'jaredhanson' };
      this.success(user);
    };

    var passport = new Passport();
    passport.use('success', new Strategy());

    var request, error;

    function configurator(req, done) {
      return done(null, 'success');
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

    it('should not error', function() {
      expect(error).to.be.undefined;
    });

    it('should set user', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.id).to.equal('1');
      expect(request.user.username).to.equal('jaredhanson');
    });

    it('should set authInfo', function() {
      expect(request.authInfo).to.be.an('object');
      expect(Object.keys(request.authInfo)).to.have.length(0);
    });
  });

  describe('success with configurator-specific options', function() {
    function Local() {
    }
    Local.prototype.authenticate = function(req) {
      var user = { local: true, external: false };
      this.success(user);
    };

    function External() {
    }
    External.prototype.authenticate = function(req) {
      var user = { local: false, external: true };
      this.success(user);
    };

    var passport = new Passport();
    passport.use('local', new Local());
    passport.use('external', new External());

    var request, error;

    function configurator(req, options, done) {
      return (options.ips.indexOf(req.ip) !== -1)
        ? done(null, 'local')
        : done(null, 'external');
    }

    before(function(done) {
      chai.connect.use(authenticateWith(passport, configurator, { ips: [ '1.2.3.4', '5.6.7.8' ] }))
        .req(function(req) {
          request = req;

          req.ip = '1.2.3.4';

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

    it('should not error', function() {
      expect(error).to.be.undefined;
    });

    it('should set user', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.local).to.be.true;
      expect(request.user.external).to.be.false;
    });

    it('should set authInfo', function() {
      expect(request.authInfo).to.be.an('object');
      expect(Object.keys(request.authInfo)).to.have.length(0);
    });
  });
});
