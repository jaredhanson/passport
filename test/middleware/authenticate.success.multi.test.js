var chai = require('chai')
  , authenticate = require('../../lib/passport/middleware/authenticate')
  , Passport = require('../..').Passport;


describe('middleware/authenticate', function() {
  
  describe('with multiple strategies, the first of which succeeds', function() {
    function StrategyA() {
    }
    StrategyA.prototype.authenticate = function(req) {
      this.success({ username: 'bob-a' });
    }
    
    function StrategyB() {
    }
    StrategyB.prototype.authenticate = function(req) {
      this.success({ username: 'bob-b' });
    }
    
    var passport = new Passport();
    passport.use('a', new StrategyA());
    passport.use('b', new StrategyB());
    
    var request, error;

    before(function(done) {
      chai.connect.use(authenticate(['a', 'b']).bind(passport))
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
      expect(request.user.username).to.equal('bob-a');
    });
  });
  
  describe('with multiple strategies, the second of which succeeds', function() {
    function StrategyA() {
    }
    StrategyA.prototype.authenticate = function(req) {
      this.fail('A challenge');
    }
    
    function StrategyB() {
    }
    StrategyB.prototype.authenticate = function(req) {
      this.success({ username: 'bob-b' });
    }
    
    var passport = new Passport();
    passport.use('a', new StrategyA());
    passport.use('b', new StrategyB());
    
    var request, error;

    before(function(done) {
      chai.connect.use(authenticate(['a', 'b']).bind(passport))
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
      expect(request.user.username).to.equal('bob-b');
    });
  });
  
  describe('with multiple strategies, both of which fail', function() {
    function StrategyA() {
    }
    StrategyA.prototype.authenticate = function(req) {
      this.fail('A challenge');
    }
    
    function StrategyB() {
    }
    StrategyB.prototype.authenticate = function(req) {
      this.fail('B challenge');
    }
    
    var passport = new Passport();
    passport.use('a', new StrategyA());
    passport.use('b', new StrategyB());
    
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
      expect(request.message.msg).to.equal('A challenge');
    });
  
    it('should redirect', function() {
      expect(response.statusCode).to.equal(302);
      expect(response.getHeader('Location')).to.equal('http://www.example.com/login');
    });
  });
  
});
