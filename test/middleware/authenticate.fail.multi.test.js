var chai = require('chai')
  , authenticate = require('../../lib/passport/middleware/authenticate')
  , Passport = require('../..').Passport;


describe('middleware/authenticate', function() {
  
  describe('with multiple strategies, all of which fail, and responding with unauthorized status', function() {
    function BasicStrategy() {
    }
    BasicStrategy.prototype.authenticate = function(req) {
      this.fail('BASIC challenge');
    }
    
    function DigestStrategy() {
    }
    DigestStrategy.prototype.authenticate = function(req) {
      this.fail('DIGEST challenge');
    }
    
    function NoChallengeStrategy() {
    }
    NoChallengeStrategy.prototype.authenticate = function(req) {
      this.fail();
    }
    
    var passport = new Passport();
    passport.use('basic', new BasicStrategy());
    passport.use('digest', new DigestStrategy());
    passport.use('no-challenge', new NoChallengeStrategy());

    var received = null;
    passport.on('fail', function(req) {
      received = req;
    });
    
    var request, response;

    before(function(done) {
      chai.connect.use(authenticate(['basic', 'no-challenge', 'digest']).bind(passport))
        .req(function(req) {
          request = req;
          
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
    
    it('should not set user', function() {
      expect(request.user).to.be.undefined;
    });
  
    it('should respond', function() {
      expect(response.statusCode).to.equal(401);
      expect(response.body).to.equal('Unauthorized');
    });
    
    it('should set authenticate header on response', function() {
      var val = response.getHeader('WWW-Authenticate');
      expect(val).to.be.an('array');
      expect(val).to.have.length(2);
      
      expect(val[0]).to.equal('BASIC challenge');
      expect(val[1]).to.equal('DIGEST challenge');
    });

    it('should emit event', function() {
      expect(received).to.equal(request);
    });
  });
  
  describe('with multiple strategies, all of which fail, and responding with specified status', function() {
    function BasicStrategy() {
    }
    BasicStrategy.prototype.authenticate = function(req) {
      this.fail('BASIC challenge', 400);
    }
    
    function BearerStrategy() {
    }
    BearerStrategy.prototype.authenticate = function(req) {
      this.fail('BEARER challenge', 403);
    }
    
    function NoChallengeStrategy() {
    }
    NoChallengeStrategy.prototype.authenticate = function(req) {
      this.fail(402);
    }
    
    var passport = new Passport();
    passport.use('basic', new BasicStrategy());
    passport.use('bearer', new BearerStrategy());
    passport.use('no-challenge', new NoChallengeStrategy());

    var received = null;
    passport.on('fail', function(req) {
      received = req;
    });
    
    var request, response;

    before(function(done) {
      chai.connect.use(authenticate(['basic', 'no-challenge', 'bearer']).bind(passport))
        .req(function(req) {
          request = req;
          
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
    
    it('should not set user', function() {
      expect(request.user).to.be.undefined;
    });
  
    it('should respond', function() {
      expect(response.statusCode).to.equal(400);
      expect(response.getHeader('WWW-Authenticate')).to.be.undefined;
      expect(response.body).to.equal('Bad Request');
    });

    it('should emit event', function() {
      expect(received).to.equal(request);
    });
  });
  
  describe('with multiple strategies, all of which fail, and flashing message', function() {
    function StrategyA() {
    }
    StrategyA.prototype.authenticate = function(req) {
      this.fail('A message');
    }
    
    function StrategyB() {
    }
    StrategyB.prototype.authenticate = function(req) {
      this.fail('B message');
    }
    
    var passport = new Passport();
    passport.use('a', new StrategyA());
    passport.use('b', new StrategyB());

    var received = null;
    passport.on('fail', function(req) {
      received = req;
    });
    
    var request, response;

    before(function(done) {
      chai.connect.use('express', authenticate(['a', 'b'], { failureFlash: true,
                                                             failureRedirect: 'http://www.example.com/login' }).bind(passport))
        .req(function(req) {
          request = req;
          
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
    
    it('should not set user', function() {
      expect(request.user).to.be.undefined;
    });
    
    it('should flash message', function() {
      expect(request.message.type).to.equal('error');
      expect(request.message.msg).to.equal('A message');
    });
  
    it('should redirect', function() {
      expect(response.statusCode).to.equal(302);
      expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
    });

    it('should emit event', function() {
      expect(received).to.equal(request);
    });
  });
  
  describe('with multiple strategies, all of which fail with unauthorized status, and invoking callback', function() {
    function BasicStrategy() {
    }
    BasicStrategy.prototype.authenticate = function(req) {
      this.fail('BASIC challenge');
    }
    
    function DigestStrategy() {
    }
    DigestStrategy.prototype.authenticate = function(req) {
      this.fail('DIGEST challenge');
    }
    
    function NoChallengeStrategy() {
    }
    NoChallengeStrategy.prototype.authenticate = function(req) {
      this.fail();
    }
    
    var passport = new Passport();
    passport.use('basic', new BasicStrategy());
    passport.use('digest', new DigestStrategy());
    passport.use('no-challenge', new NoChallengeStrategy());

    var received = null;
    passport.on('fail', function(req) {
      received = req;
    });
    
    var request, error, user, challenge, status;

    before(function(done) {
      function callback(e, u, c, s) {
        error = e;
        user = u;
        challenge = c;
        status = s;
        done();
      }
      
      chai.connect.use(authenticate(['basic', 'no-challenge', 'digest'], callback).bind(passport))
        .req(function(req) {
          request = req;
        })
        .dispatch();
    });
    
    it('should not error', function() {
      expect(error).to.be.null;
    });
    
    it('should pass false to callback', function() {
      expect(user).to.equal(false);
    });
    
    it('should pass challenges to callback', function() {
      expect(challenge).to.be.an('array');
      expect(challenge).to.have.length(3);
      expect(challenge[0]).to.equal('BASIC challenge');
      expect(challenge[1]).to.be.undefined;
      expect(challenge[2]).to.equal('DIGEST challenge');
    });
    
    it('should pass statuses to callback', function() {
      expect(status).to.be.an('array');
      expect(status).to.have.length(3);
      expect(status[0]).to.be.undefined;
      expect(status[1]).to.be.undefined;
      expect(status[2]).to.be.undefined;
    });
    
    it('should not set user on request', function() {
      expect(request.user).to.be.undefined;
    });

    it('should not emit event', function() {
      expect(received).to.be.null;
    });
  });
  
  describe('with multiple strategies, all of which fail with specific status, and invoking callback', function() {
    function BasicStrategy() {
    }
    BasicStrategy.prototype.authenticate = function(req) {
      this.fail('BASIC challenge', 400);
    }
    
    function BearerStrategy() {
    }
    BearerStrategy.prototype.authenticate = function(req) {
      this.fail('BEARER challenge', 403);
    }
    
    function NoChallengeStrategy() {
    }
    NoChallengeStrategy.prototype.authenticate = function(req) {
      this.fail(402);
    }
    
    var passport = new Passport();
    passport.use('basic', new BasicStrategy());
    passport.use('bearer', new BearerStrategy());
    passport.use('no-challenge', new NoChallengeStrategy());

    var received = null;
    passport.on('fail', function(req) {
      received = req;
    });
    
    var request, error, user, challenge, status;

    before(function(done) {
      function callback(e, u, c, s) {
        error = e;
        user = u;
        challenge = c;
        status = s;
        done();
      }
      
      chai.connect.use(authenticate(['basic', 'no-challenge', 'bearer'], callback).bind(passport))
        .req(function(req) {
          request = req;
        })
        .dispatch();
    });
    
    it('should not error', function() {
      expect(error).to.be.null;
    });
    
    it('should pass false to callback', function() {
      expect(user).to.equal(false);
    });
    
    it('should pass challenges to callback', function() {
      expect(challenge).to.be.an('array');
      expect(challenge).to.have.length(3);
      expect(challenge[0]).to.equal('BASIC challenge');
      expect(challenge[1]).to.be.undefined;
      expect(challenge[2]).to.equal('BEARER challenge');
    });
    
    it('should pass statuses to callback', function() {
      expect(status).to.be.an('array');
      expect(status).to.have.length(3);
      expect(status[0]).to.equal(400);
      expect(status[1]).to.equal(402);
      expect(status[2]).to.equal(403);
    });
    
    it('should not set user on request', function() {
      expect(request.user).to.be.undefined;
    });

    it('should not emit event', function() {
      expect(received).to.be.null;
    });
  });
  
  describe('with single strategy in list, which fails with unauthorized status, and invoking callback', function() {
    function BasicStrategy() {
    }
    BasicStrategy.prototype.authenticate = function(req) {
      this.fail('BASIC challenge');
    }
    
    var passport = new Passport();
    passport.use('basic', new BasicStrategy());

    var received = null;
    passport.on('fail', function(req) {
      received = req;
    });
    
    var request, error, user, challenge, status;

    before(function(done) {
      function callback(e, u, c, s) {
        error = e;
        user = u;
        challenge = c;
        status = s;
        done();
      }
      
      chai.connect.use(authenticate(['basic'], callback).bind(passport))
        .req(function(req) {
          request = req;
        })
        .dispatch();
    });
    
    it('should not error', function() {
      expect(error).to.be.null;
    });
    
    it('should pass false to callback', function() {
      expect(user).to.equal(false);
    });
    
    it('should pass challenges to callback', function() {
      expect(challenge).to.be.an('array');
      expect(challenge).to.have.length(1);
      expect(challenge[0]).to.equal('BASIC challenge');
    });
    
    it('should pass statuses to callback', function() {
      expect(status).to.be.an('array');
      expect(status).to.have.length(1);
      expect(status[0]).to.be.undefined;
    });
    
    it('should not set user on request', function() {
      expect(request.user).to.be.undefined;
    });

    it('should not emit event', function() {
      expect(received).to.be.null;
    });
  });
  
});
