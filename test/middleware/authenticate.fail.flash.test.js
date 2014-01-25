/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , authenticate = require('../../lib/middleware/authenticate')
  , Passport = require('../..').Passport;


describe('middleware/authenticate', function() {
  
  describe('using strategy that specifies message', function() {
    
    describe('fail with flash message', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail({ message: 'Invalid password' });
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: true,
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('error');
        expect(request.message.msg).to.equal('Invalid password');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message using type set by route', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail({ message: 'Invalid password' });
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { type: 'info' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('info');
        expect(request.message.msg).to.equal('Invalid password');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message overridden by route as string', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail({ message: 'Invalid password' });
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: 'Wrong credentials',
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('error');
        expect(request.message.msg).to.equal('Wrong credentials');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message overridden by route using options', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail({ message: 'Invalid password' });
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { message: 'Try again' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('error');
        expect(request.message.msg).to.equal('Try again');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message overridden by route using options with type', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail({ message: 'Invalid password' });
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { type: 'notice', message: 'Try again' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('notice');
        expect(request.message.msg).to.equal('Try again');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
  });
  
  
  describe('using strategy that specifies message and type', function() {
    
    describe('fail with flash message', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail({ type: 'notice', message: 'Invite required' });
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: true,
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('notice');
        expect(request.message.msg).to.equal('Invite required');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message using type set by route', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail({ type: 'notice', message: 'Invite required' });
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { type: 'info' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('info');
        expect(request.message.msg).to.equal('Invite required');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message overridden by route as string', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail({ type: 'notice', message: 'Invite required' });
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: 'Wrong credentials',
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('error');
        expect(request.message.msg).to.equal('Wrong credentials');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message overridden by route using options', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail({ type: 'notice', message: 'Invite required' });
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { message: 'Try again' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('error');
        expect(request.message.msg).to.equal('Try again');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message overridden by route using options with type', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail({ type: 'notice', message: 'Invite required' });
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { type: 'info', message: 'Try again' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('info');
        expect(request.message.msg).to.equal('Try again');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
  });
  
  
  describe('using strategy that specifies message as string', function() {
    
    describe('fail with flash message', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail('Access denied');
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: true,
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('error');
        expect(request.message.msg).to.equal('Access denied');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message using type set by route', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail('Access denied');
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { type: 'info' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('info');
        expect(request.message.msg).to.equal('Access denied');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message overridden by route as string', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail('Access denied');
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: 'Wrong credentials',
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('error');
        expect(request.message.msg).to.equal('Wrong credentials');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message overridden by route using options', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail('Access denied');
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { message: 'Try again' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('error');
        expect(request.message.msg).to.equal('Try again');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message overridden by route using options with type', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail('Access denied');
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { type: 'notice', message: 'Try again' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('notice');
        expect(request.message.msg).to.equal('Try again');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
  });
  
  
  describe('using strategy that does not specify message', function() {
    
    describe('fail with flash message left up to strategy', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail();
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: true,
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should not flash message', function() {
        expect(request.message).to.be.undefined;
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message left up to strategy using type set by route', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail();
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { type: 'info' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should not flash message', function() {
        expect(request.message).to.be.undefined;
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message specified by route as string', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail();
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: 'Wrong credentials',
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('error');
        expect(request.message.msg).to.equal('Wrong credentials');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message specified by route using options', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail();
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { message: 'Try again' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('error');
        expect(request.message.msg).to.equal('Try again');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
    describe('fail with flash message specified by route using options with type', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
        this.fail();
      };
    
      var passport = new Passport();
      passport.use('fail', new Strategy());
    
      var request, response;

      before(function(done) {
        chai.connect.use('express', authenticate(passport, 'fail', { failureFlash: { type: 'notice', message: 'Try again' },
                                                           failureRedirect: 'http://www.example.com/login' }))
          .req(function(req) {
            request = req;
            req.session = {};
            
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
    
      it('should not set user', function() {
        expect(request.user).to.be.undefined;
      });
    
      it('should flash message', function() {
        expect(request.message.type).to.equal('notice');
        expect(request.message.msg).to.equal('Try again');
      });
    
      it('should redirect', function() {
        expect(response.statusCode).to.equal(302);
        expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
      });
    });
    
  });
  
});
