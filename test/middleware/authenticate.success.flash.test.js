var chai = require('chai')
  , authenticate = require('../../lib/passport/middleware/authenticate')
  , Passport = require('../..').Passport;


describe('middleware/authenticate', function() {
  
  describe('using strategy that specifies message', function() {
    
    describe('success with flash message', function() {
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
  
    describe('success with flash message using type set by route', function() {
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
        chai.connect.use('express', authenticate('success', { successFlash: { type: 'info' },
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
        expect(request.message.type).to.equal('info');
        expect(request.message.msg).to.equal('Welcome!');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/account');
      });
    });
    
    describe('success with flash message overridden by route as string', function() {
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
  
    describe('success with flash message overridden by route using options', function() {
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
  
    describe('success with flash message overridden by route using options with type', function() {
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
    
  });
  
  
  describe('using strategy that specifies message and type', function() {
  
    describe('success with flash message', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req, options) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user, { type: 'info', message: 'Hello' });
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
        expect(request.message.type).to.equal('info');
        expect(request.message.msg).to.equal('Hello');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/account');
      });
    });
  
    describe('success with flash message overridden by route as string', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req, options) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user, { type: 'info', message: 'Hello' });
      }    
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate('success', { successFlash: 'Success!',
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
        expect(request.message.msg).to.equal('Success!');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/account');
      });
    });
  
  });
  
});
