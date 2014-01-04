var chai = require('chai')
  , authenticate = require('../../lib/passport/middleware/authenticate')
  , Passport = require('../..').Passport;


describe('middleware/authenticate', function() {
  
  describe('success', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req) {
      var user = { id: '1', username: 'jaredhanson' };
      this.success(user);
    }    
    
    var passport = new Passport();
    passport.use('success', new Strategy());
    
    var request, error;

    before(function(done) {
      chai.connect.use(authenticate('success').bind(passport))
        .req(function(req) {
          request = req;
          
          req.logIn = function(user, options, done) {
            this.user = user;
            done();
          }
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
  
  describe('success with strategy-specific options', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req, options) {
      var user = { id: '1', username: 'jaredhanson' };
      if (options.scope == 'email') {
        user.email = 'jaredhanson@example.com';
      }
      this.success(user);
    }    
    
    var passport = new Passport();
    passport.use('success', new Strategy());
    
    var request, error;

    before(function(done) {
      chai.connect.use(authenticate('success', { scope: 'email' }).bind(passport))
        .req(function(req) {
          request = req;
          
          req.logIn = function(user, options, done) {
            if (options.scope != 'email') { return done(new Error('invalid options')); }
            this.user = user;
            done();
          }
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
      expect(request.user.email).to.equal('jaredhanson@example.com');
    });
    
    it('should set authInfo', function() {
      expect(request.authInfo).to.be.an('object');
      expect(Object.keys(request.authInfo)).to.have.length(0);
    });
  });
  
  describe('success with redirect', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req, options) {
      var user = { id: '1', username: 'jaredhanson' };
      this.success(user);
    }    
    
    var passport = new Passport();
    passport.use('success', new Strategy());
    
    var request, response;

    before(function(done) {
      chai.connect.use('express', authenticate('success', { successRedirect: 'http://www.example.com/account' }).bind(passport))
        .req(function(req) {
          request = req;
          
          req.logIn = function(user, options, done) {
            this.user = user;
            done();
          }
        })
        .end(function(res) {
          response = res;
          done();
        })
        .dispatch();
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
    
    it('should redirect', function() {
      expect(response.statusCode).to.equal(302);
      expect(response.getHeader('Location')).to.equal('http://www.example.com/account');
    });
  });
  
  describe('success, but login that encounters an error', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req) {
      var user = { id: '1', username: 'jaredhanson' };
      this.success(user);
    }    
    
    var passport = new Passport();
    passport.use('success', new Strategy());
    
    var request, error;

    before(function(done) {
      chai.connect.use(authenticate('success').bind(passport))
        .req(function(req) {
          request = req;
          
          req.logIn = function(user, options, done) {
            done(new Error('something went wrong'));
          }
        })
        .next(function(err) {
          error = err;
          done();
        })
        .dispatch();
    });
    
    it('should error', function() {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('something went wrong');
    });
    
    it('should not set user', function() {
      expect(request.user).to.be.undefined;
    });
    
    it('should not set authInfo', function() {
      expect(request.authInfo).to.be.undefined;
    });
  });
  
});
