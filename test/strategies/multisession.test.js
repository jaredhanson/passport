/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , MultiSessionStrategy = require('../../lib/strategies/multisession');


describe('MultiSessionStrategy', function() {
  
  var strategy = new MultiSessionStrategy();
  
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
          req.session = {};
          req.session['passport'] = {};
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
    var strategy = new MultiSessionStrategy(function(user, req, done) {
      done(null, user);
    });
    
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
          req.session = {};
          req.session['passport'] = {};
          req.session['passport'][0] = {};
          req.session['passport'][0].user = { id: '123456', displayName: 'Alice' };
        })
        .authenticate();
    });
  
    it('should pass', function() {
      expect(pass).to.be.true;
    });
    
    it('should set user on request', function() {
      expect(request.user).to.deep.equal({
        id: '123456',
        displayName: 'Alice'
      });
    });
    
    it('should maintain session', function() {
      expect(request.session['passport']).to.deep.equal({
        0: {
          user: { id: '123456', displayName: 'Alice' }
        }
      });
    });
  });
  
});
