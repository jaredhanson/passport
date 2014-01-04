var chai = require('chai')
  , initialize = require('../../lib/passport/middleware/initialize')
  , Passport = require('../..').Passport;


describe('middleware/initialize', function() {
  
  var passport = new Passport();
  passport.deserializeUser(function(id, done) {
    done(null, { id: id });
  });
  
  it('should be named initialize', function() {
    expect(initialize().name).to.equal('initialize');
  });
  
  describe('handling a request without a session', function() {
    var request, error;

    before(function(done) {
      chai.connect.use(initialize().bind(passport))
        .req(function(req) {
          request = req;
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
    
    it('should expose authenticator on internal request property', function() {
      expect(request._passport).to.be.an('object');
      expect(request._passport.instance).to.be.an.instanceOf(Passport);
      expect(request._passport.instance).to.equal(passport);
    });
    
    it('should expose empty session on internal request property', function() {
      expect(request._passport.session).to.be.an('object')
      expect(Object.keys(request._passport.session)).to.have.length(0);
    });
  });
  
});
