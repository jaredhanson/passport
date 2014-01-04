var chai = require('chai')
  , SessionStrategy = require('../../lib/passport/strategies/session');


describe('SessionStrategy', function() {
  
  var strategy = new SessionStrategy();
  
  it('should be named session', function() {
    expect(strategy.name).to.equal('session');
  });
  
  describe('handling a request without a login session', function() {
    var request, pass = false;
  
    before(function(done) {
      chai.passport.use(strategy)
        .pass(function() {
          pass = true;
          done();
        })
        .req(function(req) {
          request = req;
          
          req._passport = {};
          req._passport.session = {};
        })
        .authenticate();
    });
  
    it('should pass', function() {
      expect(pass).to.be.true;
    });
    
    it('should not set user on request', function() {
      expect(request.user).to.be.undefined;
    });
  });
  
  describe('handling a request with a login session', function() {
    var request, pass = false;
  
    before(function(done) {
      chai.passport.use(strategy)
        .pass(function() {
          pass = true;
          done();
        })
        .req(function(req) {
          request = req;
          
          req._passport = {};
          req._passport.instance = {};
          req._passport.instance.deserializeUser = function(user, done) {
            done(null, { id: user });
          };
          req._passport.session = {};
          req._passport.session.user = '123456';
        })
        .authenticate();
    });
  
    it('should pass', function() {
      expect(pass).to.be.true;
    });
    
    it('should not set user on request', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.id).to.equal('123456');
    });
    
    it('should maintain session', function() {
      expect(request._passport.session).to.be.an('object');
      expect(request._passport.session.user).to.equal('123456');
    });
  });
  
  describe('handling a request with a login session serialized to 0', function() {
    var request, pass = false;
  
    before(function(done) {
      chai.passport.use(strategy)
        .pass(function() {
          pass = true;
          done();
        })
        .req(function(req) {
          request = req;
          
          req._passport = {};
          req._passport.instance = {};
          req._passport.instance.deserializeUser = function(user, done) {
            done(null, { id: user });
          };
          req._passport.session = {};
          req._passport.session.user = 0;
        })
        .authenticate();
    });
  
    it('should pass', function() {
      expect(pass).to.be.true;
    });
    
    it('should not set user on request', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.id).to.equal(0);
    });
    
    it('should maintain session', function() {
      expect(request._passport.session).to.be.an('object');
      expect(request._passport.session.user).to.equal(0);
    });
  });
  
});
