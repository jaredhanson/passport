/* global describe, it, expect, before */
/* jshint expr: true */

var request = require('../../lib/http/request')
  , Passport = require('../..').Passport;


describe('http.ServerRequest', function() {
  
  // TODO: Test that these are extended by initialize/authenticate
  /*
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
  */
  
  describe('#login', function() {
    
    describe('not establishing a session', function() {
      var passport = new Passport();
      
      var req = new Object();
      req.login = request.login;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req._passport = {};
      req._passport.instance = passport;
      req.session = {};
      req.session['passport'] = {};
      
      var error;
      
      before(function(done) {
        var user = { id: '1', username: 'root' };
        
        req.login(user, { session: false }, function(err) {
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
      
      it('should not serialize user', function() {
        expect(req.session['passport'].user).to.be.undefined;
      });
    });
    
    describe('not establishing a session and setting custom user property', function() {
      var passport = new Passport();
      passport._userProperty = 'currentUser';
      
      var req = new Object();
      req.login = request.login;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req._passport = {};
      req._passport.instance = passport;
      req.session = {};
      req.session['passport'] = {};
      
      var error;
      
      before(function(done) {
        var user = { id: '1', username: 'root' };
        
        req.login(user, { session: false }, function(err) {
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
      
      it('should not set user', function() {
        expect(req.user).to.be.undefined;
      });
      
      it('should set custom user', function() {
        expect(req.currentUser).to.be.an('object');
        expect(req.currentUser.id).to.equal('1');
        expect(req.currentUser.username).to.equal('root');
      });
      
      it('should not serialize user', function() {
        expect(req.session['passport'].user).to.be.undefined;
      });
    });
    
    describe('not establishing a session and invoked without a callback', function() {
      var passport = new Passport();
      
      var req = new Object();
      req.login = request.login;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req._passport = {};
      req._passport.instance = passport;
      req.session = {};
      req.session['passport'] = {};
      
      var user = { id: '1', username: 'root' };
      req.login(user, { session: false });
      
      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });
      
      it('should set user', function() {
        expect(req.user).to.be.an('object');
        expect(req.user.id).to.equal('1');
        expect(req.user.username).to.equal('root');
      });
      
      it('should not serialize user', function() {
        expect(req.session['passport'].user).to.be.undefined;
      });
    });
    
    describe('not establishing a session, without passport.initialize() middleware', function() {
      var req = new Object();
      req.login = request.login;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      
      var error;
      
      before(function(done) {
        var user = { id: '1', username: 'root' };
        
        req.login(user, { session: false }, function(err) {
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
    });
    
    describe('establishing a session', function() {
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      var req = new Object();
      req.login = request.login;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req._passport = {};
      req._passport.instance = passport;
      req.session = {};
      
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
        expect(req.session['passport'].user).to.equal('1');
      });
    });
    
    describe('establishing a session and setting custom user property', function() {
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      passport._userProperty = 'currentUser';
      
      var req = new Object();
      req.login = request.login;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req._passport = {};
      req._passport.instance = passport;
      req.session = {};
      
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
      
      it('should not set user', function() {
        expect(req.user).to.be.undefined;
      });
      
      it('should set custom user', function() {
        expect(req.currentUser).to.be.an('object');
        expect(req.currentUser.id).to.equal('1');
        expect(req.currentUser.username).to.equal('root');
      });
      
      it('should serialize user', function() {
        expect(req.session['passport'].user).to.equal('1');
      });
    });
    
    describe('encountering an error when serializing to session', function() {
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(new Error('something went wrong'));
      });
      
      var req = new Object();
      req.login = request.login;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req._passport = {};
      req._passport.instance = passport;
      req.session = {};
      req.session['passport'] = {};
      
      var error;
      
      before(function(done) {
        var user = { id: '1', username: 'root' };
        
        req.login(user, function(err) {
          error = err;
          done();
        });
      });
      
      it('should error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('something went wrong');
      });
      
      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
      
      it('should not set user', function() {
        expect(req.user).to.be.null;
      });
      
      it('should not serialize user', function() {
        expect(req.session['passport'].user).to.be.undefined;
      });
    });
    
    describe('establishing a session, without passport.initialize() middleware', function() {
      var req = new Object();
      req.login = request.login;
      var user = { id: '1', username: 'root' };
      
      it('should throw an exception', function() {
        expect(function() {
          req.login(user, function(err) {});
        }).to.throw(Error, 'passport.initialize() middleware not in use');
      });
    });
    
    describe('establishing a session, but not passing a callback argument', function() {
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      var req = new Object();
      req.login = request.login;
      req._passport = {};
      req._passport.instance = passport;
      req.session = {};
      req.session['passport'] = {};
      
      var user = { id: '1', username: 'root' };
      
      it('should throw an exception', function() {
        expect(function() {
          req.login(user);
        }).to.throw(Error, 'req#login requires a callback function');
      });
    });
    
  });
  
  
  describe('#logout', function() {
    
    describe('existing session', function() {
      var passport = new Passport();
      
      var req = new Object();
      req.logout = request.logout;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req.user = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = passport;
      req.session = {};
      req.session['passport'] = {};
      req.session['passport'].user = '1';
      
      req.logout();
      
      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
      
      it('should clear user', function() {
        expect(req.user).to.be.null;
      });
      
      it('should clear serialized user', function() {
        expect(req.session['passport'].user).to.be.undefined;
      });
    });
    
    describe('existing session and clearing custom user property', function() {
      var passport = new Passport();
      
      var req = new Object();
      req.logout = request.logout;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req.currentUser = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = passport;
      req._passport.instance._userProperty = 'currentUser';
      req.session = {};
      req.session['passport'] = {};
      req.session['passport'].user = '1';
      
      req.logout();
      
      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
      
      it('should clear user', function() {
        expect(req.currentUser).to.be.null;
      });
      
      it('should clear serialized user', function() {
        expect(req.session['passport'].user).to.be.undefined;
      });
    });
    
    describe('existing session, without passport.initialize() middleware', function() {
      var req = new Object();
      req.logout = request.logout;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req.user = { id: '1', username: 'root' };
      
      req.logout();
      
      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
      
      it('should clear user', function() {
        expect(req.user).to.be.null;
      });
    });
    
  });
  
  
  describe('#isAuthenticated', function() {
    
    describe('with a user', function() {
      var req = new Object();
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req.user = { id: '1', username: 'root' };
      
      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });
    });
    
    describe('with a user set on custom property', function() {
      var req = new Object();
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req.currentUser = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = {};
      req._passport.instance._userProperty = 'currentUser';
      
      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });
    });
    
    describe('without a user', function() {
      var req = new Object();
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      
      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
    });
    
    describe('with a null user', function() {
      var req = new Object();
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req.user = null;
      
      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
    });
    
  });
  
});
