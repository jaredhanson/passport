var chai = require('chai')
  , authenticate = require('../../lib/passport/middleware/authenticate')
  , Passport = require('../..').Passport;


describe('middleware/authenticate', function() {
  
  describe('success with flash set by route', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req, options) {
      var user = { id: '1', username: 'jaredhanson' };
      this.success(user, { message: 'Welcome!' });
    }    
    
    var passport = new Passport();
    passport.use('success', new Strategy());
    
    var request, response;

    before(function(done) {
      chai.connect.use('express', authenticate('success', { successFlash: 'Login complete',
                                                            successRedirect: 'http://www.example.com/account' }).bind(passport))
        .req(function(req) {
          request = req;
          req.session = {};
          
          req.logIn = function(user, options, done) {
            this.user = user;
            done();
          }
          req.flash = function(type, msg) {
            this.message = { type: type, msg: msg }
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
    
    it('should flash message', function() {
      expect(request.message.type).to.equal('success');
      expect(request.message.msg).to.equal('Login complete');
    });
    
    it('should redirect', function() {
      expect(response.statusCode).to.equal(302);
      expect(response.getHeader('Location')).to.equal('http://www.example.com/account');
    });
  });
  
  describe('success with flash set by route using options', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req, options) {
      var user = { id: '1', username: 'jaredhanson' };
      this.success(user, { message: 'Welcome!' });
    }    
    
    var passport = new Passport();
    passport.use('success', new Strategy());
    
    var request, response;

    before(function(done) {
      chai.connect.use('express', authenticate('success', { successFlash: { type: 'notice', message: 'Last login was yesterday' },
                                                            successRedirect: 'http://www.example.com/account' }).bind(passport))
        .req(function(req) {
          request = req;
          req.session = {};
          
          req.logIn = function(user, options, done) {
            this.user = user;
            done();
          }
          req.flash = function(type, msg) {
            this.message = { type: type, msg: msg }
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
    
    it('should flash message', function() {
      expect(request.message.type).to.equal('notice');
      expect(request.message.msg).to.equal('Last login was yesterday');
    });
    
    it('should redirect', function() {
      expect(response.statusCode).to.equal(302);
      expect(response.getHeader('Location')).to.equal('http://www.example.com/account');
    });
  });
  
  describe('success with flash set by route using options with only message', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req, options) {
      var user = { id: '1', username: 'jaredhanson' };
      this.success(user, { message: 'Welcome!' });
    }    
    
    var passport = new Passport();
    passport.use('success', new Strategy());
    
    var request, response;

    before(function(done) {
      chai.connect.use('express', authenticate('success', { successFlash: { message: 'OK' },
                                                            successRedirect: 'http://www.example.com/account' }).bind(passport))
        .req(function(req) {
          request = req;
          req.session = {};
          
          req.logIn = function(user, options, done) {
            this.user = user;
            done();
          }
          req.flash = function(type, msg) {
            this.message = { type: type, msg: msg }
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
    
    it('should flash message', function() {
      expect(request.message.type).to.equal('success');
      expect(request.message.msg).to.equal('OK');
    });
    
    it('should redirect', function() {
      expect(response.statusCode).to.equal(302);
      expect(response.getHeader('Location')).to.equal('http://www.example.com/account');
    });
  });
  
  describe('success with flash set by strategy', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req, options) {
      var user = { id: '1', username: 'jaredhanson' };
      this.success(user, { message: 'Welcome!' });
    }    
    
    var passport = new Passport();
    passport.use('success', new Strategy());
    
    var request, response;

    before(function(done) {
      chai.connect.use('express', authenticate('success', { successFlash: true,
                                                            successRedirect: 'http://www.example.com/account' }).bind(passport))
        .req(function(req) {
          request = req;
          req.session = {};
          
          req.logIn = function(user, options, done) {
            this.user = user;
            done();
          }
          req.flash = function(type, msg) {
            this.message = { type: type, msg: msg }
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
    
    it('should flash message', function() {
      expect(request.message.type).to.equal('success');
      expect(request.message.msg).to.equal('Welcome!');
    });
    
    it('should redirect', function() {
      expect(response.statusCode).to.equal(302);
      expect(response.getHeader('Location')).to.equal('http://www.example.com/account');
    });
  });
  
});
