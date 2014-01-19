var http = require('http')
  , Passport = require('../..').Passport;

require('../../lib/passport/http/request');


describe('http.ServerRequest', function() {
  
  describe('prototoype', function() {
    var req = new http.IncomingMessage();
    
    it('should be extended with login', function() {
      expect(req.login).to.be.an('function');
      expect(req.login).to.equal(req.logIn);
    });
    
    it('should be extended with logout', function() {
      expect(req.logout).to.be.an('function');
      expect(req.logout).to.equal(req.logOut);
    });
    
    it('should be extended with isAuthenticated', function() {
      expect(req.isAuthenticated).to.be.an('function');
    });
    
    it('should be extended with isUnauthenticated', function() {
      expect(req.isUnauthenticated).to.be.an('function');
    });
  });
  
  describe('#login', function() {
    
    describe('establishing a session', function() {
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      var req = new http.IncomingMessage();
      req._passport = {};
      req._passport.instance = passport;
      req._passport.session = {};
      
      var error;
      
      before(function(done) {
        var user = { id: '1', username: 'root' };
        
        req.login(user, function(err) {
          error = err;
          done();
        });
      });
      
      it('should not error', function() {
        expect(error).to.be.undefined;
      });
      
      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });
      
      it('should set user', function() {
        expect(req.user).to.be.an('object');
        expect(req.user.id).to.equal('1');
        expect(req.user.username).to.equal('root');
      });
      
      it('should serialize user', function() {
        expect(req._passport.session.user).to.equal('1');
      });
    });
    
  });
  
});
