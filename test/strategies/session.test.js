var chai = require('chai')
  , SessionStrategy = require('../../lib/passport/strategies/session');


describe('SessionStrategy', function() {
  
  var strategy = new SessionStrategy();
  
  it('should be named session', function() {
    expect(strategy.name).to.equal('session');
  });
  
  describe('handling a request without a login session', function() {
    var pass = false;
  
    before(function(done) {
      chai.passport.use(strategy)
        .pass(function() {
          pass = true;
          done();
        })
        .req(function(req) {
          req._passport = {};
          req._passport.session = {};
        })
        .authenticate();
    });
  
    it('should pass', function() {
      expect(pass).to.be.true;
    });
  });
  
});
