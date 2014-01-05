var chai = require('chai')
  , authenticate = require('../../lib/passport/middleware/authenticate')
  , Passport = require('../..').Passport;


describe('middleware/authenticate', function() {
  
  describe('with multiple strategies, both of which fail, and flashing message', function() {
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
