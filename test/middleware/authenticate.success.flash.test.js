/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , authenticate = require('../../lib/middleware/authenticate')
  , Passport = require('../..').Passport;


describe('middleware/authenticate', function() {
  
  describe('using strategy that specifies message', function() {
    
    describe('success with flash message', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req, options) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user, { message: 'Welcome!' });
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: true,
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { type: 'info' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: 'Login complete',
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { message: 'OK' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { type: 'notice', message: 'Last login was yesterday' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: true,
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
    
    describe('success with flash message using type set by route', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req, options) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user, { type: 'info', message: 'Hello' });
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { type: 'ok' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
        expect(request.message.type).to.equal('ok');
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
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: 'Success!',
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
    
    describe('success with flash message overridden by route using options', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req, options) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user, { type: 'info', message: 'Hello' });
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { message: 'Okay' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
        expect(request.message.msg).to.equal('Okay');
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
        this.success(user, { type: 'info', message: 'Hello' });
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { type: 'warn', message: 'Last login from far away place' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
        expect(request.message.type).to.equal('warn');
        expect(request.message.msg).to.equal('Last login from far away place');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/account');
      });
    });
  
  });
  
  
  describe('using strategy that specifies message as string', function() {
    
    describe('success with flash message', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req, options) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user, 'Greetings');
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: true,
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
        expect(request.message.msg).to.equal('Greetings');
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
        this.success(user, 'Greetings');
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { type: 'info' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
        expect(request.message.msg).to.equal('Greetings');
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
        this.success(user, 'Greetings');
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: 'Login complete',
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
        this.success(user, 'Greetings');
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { message: 'OK' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
        this.success(user, 'Greetings');
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { type: 'notice', message: 'Last login was yesterday' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
  
  
  describe('using strategy that does not specify message', function() {
    
    describe('success with flash message left up to strategy', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req, options) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user);
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: true,
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
    
      it('should not flash message', function() {
        expect(request.message).to.be.undefined;
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/account');
      });
    });
    
    describe('success with flash message left up to strategy using type set by route', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req, options) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user);
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { type: 'info' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
    
      it('should not flash message', function() {
        expect(request.message).to.be.undefined;
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/account');
      });
    });
    
    describe('success with flash message specified by route as string', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req, options) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user);
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: 'Login complete',
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
    
    describe('success with flash message specified by route using options', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req, options) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user);
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { message: 'OK' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
    
    describe('success with flash message specified by route using options with type', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req, options) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user);
      };
    
      var passport = new Passport();
      passport.use('success', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'success', { successFlash: { type: 'notice', message: 'Last login was yesterday' },
                                                              successRedirect: 'http://www.example.com/account' }))
          .req(function(req) {
            request = req;
            req.session = {};
          
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
            req.flash = function(type, msg) {
              this.message = { type: type, msg: msg };
            };
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
  
});
