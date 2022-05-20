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
      
      var req = new Object();
      req.login = request.login;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req._passport = {};
      req._passport.instance = passport;
      req.session = {};
      req.session['passport'] = {};
      req._userProperty = 'currentUser';
      
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
      req._sessionManager = passport._sm;
      req.session = { id: '1' };
      req.session.regenerate = function(cb) {
        req.session = { id: '2' };
        req.session.save = function(cb) {
          process.nextTick(cb);
        };
        process.nextTick(cb);
      };
      
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
      
      it('should regenerate session', function() {
        expect(req.session.id).to.equal('2');
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
    
    describe('establishing a session and not keeping previous session data', function() {
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
      req._sessionManager = passport._sm;
      req.session = { cart: [ '1', '2', ] };
      Object.defineProperty(req.session, 'id', { value: '1' });
      req.session.regenerate = function(cb) {
        req.session = { id: '2' };
        req.session.save = function(cb) {
          process.nextTick(cb);
        };
        process.nextTick(cb);
      };
      
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
      
      it('should regenerate session', function() {
        expect(req.session.id).to.equal('2');
      });
      
      it('should not keep session data', function() {
        expect(req.session.cart).to.be.undefined;
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
    
    describe('establishing a session and keeping previous session data', function() {
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
      req._sessionManager = passport._sm;
      req.session = { cart: [ '1', '2', ] };
      Object.defineProperty(req.session, 'id', { value: '1' });
      req.session.regenerate = function(cb) {
        req.session = { id: '2' };
        req.session.save = function(cb) {
          process.nextTick(cb);
        };
        process.nextTick(cb);
      };
      
      var error;
      
      before(function(done) {
        var user = { id: '1', username: 'root' };
        
        req.login(user, { keepSessionInfo: true }, function(err) {
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
      
      it('should regenerate session', function() {
        expect(req.session.id).to.equal('2');
      });
      
      it('should keep session data', function() {
        expect(req.session.cart).to.deep.equal([ '1', '2' ]);
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
      
      var req = new Object();
      req.login = request.login;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req._passport = {};
      req._passport.instance = passport;
      req._sessionManager = passport._sm;
      req.session = { id: '1' };
      req.session.regenerate = function(cb) {
        req.session = { id: '2' };
        req.session.save = function(cb) {
          process.nextTick(cb);
        };
        process.nextTick(cb);
      }
      req._userProperty = 'currentUser';
      
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
      
      it('should regenerate session', function() {
        expect(req.session.id).to.equal('2');
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
    
    describe('encountering an error when regenerating session', function() {
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
      req._sessionManager = passport._sm;
      req.session = { id: '1' };
      req.session['passport'] = {};
      req.session.regenerate = function(cb) {
        process.nextTick(function(){
          cb(new Error('something went wrong'));
        })
      }
      
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
      
      it('should not regenerate session', function() {
        expect(req.session.id).to.equal('1');
      });
      
      it('should not set user', function() {
        expect(req.user).to.be.null;
      });
      
      it('should not serialize user', function() {
        expect(req.session['passport'].user).to.be.undefined;
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
      req._sessionManager = passport._sm;
      req.session = { id: '1' };
      req.session['passport'] = {};
      req.session.regenerate = function(cb) {
        req.session = { id: '2' };
        process.nextTick(cb);
      }
      
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
      
      it('should regenerate session', function() {
        expect(req.session.id).to.equal('2');
      });
      
      it('should not set user', function() {
        expect(req.user).to.be.null;
      });
      
      it('should not serialize user', function() {
        expect(req.session['passport']).to.be.undefined;
      });
    });
    
    describe('encountering an error when saving session', function() {
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
      req._sessionManager = passport._sm;
      req.session = { id: '1' };
      req.session['passport'] = {};
      req.session.regenerate = function(cb) {
        req.session = { id: '2' };
        req.session.save = function(cb) {
          process.nextTick(function(){
            cb(new Error('something went wrong'));
          });
        };
        process.nextTick(cb);
      }
      
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
      
      it('should not regenerate session', function() {
        expect(req.session.id).to.equal('2');
      });
      
      it('should not set user', function() {
        expect(req.user).to.be.null;
      });
      
      it('should not serialize user', function() {
        expect(req.session['passport'].user).to.equal('1');
      });
    });
    
    /*
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
    */
    
    describe('establishing a session, but not passing a callback argument', function() {
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      var req = new Object();
      req.login = request.login;
      req._passport = {};
      req._passport.instance = passport;
      req._sessionManager = passport._sm;
      req.session = {};
      req.session['passport'] = {};
      
      var user = { id: '1', username: 'root' };
      
      it('should throw an exception', function() {
        expect(function() {
          req.login(user);
        }).to.throw(Error, 'req#login requires a callback function');
      });
    });
    
    describe('establishing a session without session support', function() {
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      var req = new Object();
      req.login = request.login;
      req._passport = {};
      req._passport.instance = passport;
      req._sessionManager = passport._sm;
      
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
        expect(error.message).to.equal('Login sessions require session support. Did you forget to use `express-session` middleware?');
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
      req._sessionManager = passport._sm;
      req.session = { id: '1' };
      req.session['passport'] = {};
      req.session['passport'].user = '1';
      req.session.save = function(cb) {
        expect(req.session['passport'].user).to.be.undefined;
        process.nextTick(cb);
      };
      req.session.regenerate = function(cb) {
        req.session = { id: '2' };
        process.nextTick(cb);
      };
      
      var error;
      
      before(function(done) {
        req.logout(function(err) {
          error = err;
          done();
        });
      });
      
      it('should not error', function() {
        expect(error).to.be.undefined;
      });
      
      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
      
      it('should clear user', function() {
        expect(req.user).to.be.null;
      });
      
      it('should clear serialized user', function() {
        expect(req.session['passport']).to.be.undefined;
      });
    });
    
    describe('existing session and not keeping session data', function() {
      var passport = new Passport();
      
      var req = new Object();
      req.logout = request.logout;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req.user = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = passport;
      req._sessionManager = passport._sm;
      req.session = { cart: [ '1', '2', ] };
      Object.defineProperty(req.session, 'id', { value: '1' });
      req.session['passport'] = {};
      req.session['passport'].user = '1';
      req.session.save = function(cb) {
        expect(req.session['passport'].user).to.be.undefined;
        process.nextTick(cb);
      };
      req.session.regenerate = function(cb) {
        req.session = { id: '2' };
        process.nextTick(cb);
      };
      
      var error;
      
      before(function(done) {
        req.logout(function(err) {
          error = err;
          done();
        });
      });
      
      it('should not error', function() {
        expect(error).to.be.undefined;
      });
      
      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
      
      it('should clear user', function() {
        expect(req.user).to.be.null;
      });
      
      it('should clear serialized user', function() {
        expect(req.session['passport']).to.be.undefined;
      });
      
      it('should keep session data', function() {
        expect(req.session.cart).to.be.undefined;
      });
    });
    
    describe('existing session and keeping session data', function() {
      var passport = new Passport();
      
      var req = new Object();
      req.logout = request.logout;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req.user = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = passport;
      req._sessionManager = passport._sm;
      req.session = { cart: [ '1', '2', ] };
      Object.defineProperty(req.session, 'id', { value: '1' });
      req.session['passport'] = {};
      req.session['passport'].user = '1';
      req.session.save = function(cb) {
        expect(req.session['passport'].user).to.be.undefined;
        process.nextTick(cb);
      };
      req.session.regenerate = function(cb) {
        req.session = { id: '2' };
        process.nextTick(cb);
      };
      
      var error;
      
      before(function(done) {
        req.logout({ keepSessionInfo: true }, function(err) {
          error = err;
          done();
        });
      });
      
      it('should not error', function() {
        expect(error).to.be.undefined;
      });
      
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
      
      it('should keep session data', function() {
        expect(req.session.cart).to.deep.equal([ '1', '2' ]);
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
      req._userProperty = 'currentUser';
      req._sessionManager = passport._sm;
      req.session = { id: '1' };
      req.session['passport'] = {};
      req.session['passport'].user = '1';
      req.session.save = function(cb) {
        expect(req.session['passport'].user).to.be.undefined;
        process.nextTick(cb);
      };
      req.session.regenerate = function(cb) {
        req.session = { id: '2' };
        process.nextTick(cb);
      };
      
      var error;
      
      before(function(done) {
        req.logout(function(err) {
          error = err;
          done();
        });
      });
      
      it('should not error', function() {
        expect(error).to.be.undefined;
      });
      
      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
      
      it('should clear user', function() {
        expect(req.currentUser).to.be.null;
      });
      
      it('should clear serialized user', function() {
        expect(req.session['passport']).to.be.undefined;
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
    
    describe('existing session, without passport.initialize() middleware, and invoked with a callback', function() {
      var req = new Object();
      req.logout = request.logout;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req.user = { id: '1', username: 'root' };
      
      var error;
      
      before(function(done) {
        req.logout(function(err) {
          error = err;
          done();
        });
      });
      
      it('should not error', function() {
        expect(error).to.be.undefined;
      });
      
      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
      
      it('should clear user', function() {
        expect(req.user).to.be.null;
      });
    });
    
    describe('encountering an error saving existing session', function() {
      var passport = new Passport();
      
      var req = new Object();
      req.logout = request.logout;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req.user = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = passport;
      req._sessionManager = passport._sm;
      req.session = { id: '1' };
      req.session['passport'] = {};
      req.session['passport'].user = '1';
      req.session.save = function(cb) {
        expect(req.session['passport'].user).to.be.undefined;
        process.nextTick(function() {
          cb(new Error('something went wrong'));
        });
      };
      req.session.regenerate = function(cb) {
        req.session = { id: '2' };
        process.nextTick(cb);
      };
      
      var error;
      
      before(function(done) {
        req.logout(function(err) {
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
      
      it('should clear user', function() {
        expect(req.user).to.be.null;
      });
      
      it('should clear serialized user', function() {
        expect(req.session['passport'].user).to.be.undefined;
      });
    });
    
    describe('encountering an error regenerating session', function() {
      var passport = new Passport();
      
      var req = new Object();
      req.logout = request.logout;
      req.isAuthenticated = request.isAuthenticated;
      req.isUnauthenticated = request.isUnauthenticated;
      req.user = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = passport;
      req._sessionManager = passport._sm;
      req.session = { id: '1' };
      req.session['passport'] = {};
      req.session['passport'].user = '1';
      req.session.save = function(cb) {
        expect(req.session['passport'].user).to.be.undefined;
        process.nextTick(cb);
      };
      req.session.regenerate = function(cb) {
        process.nextTick(function() {
          cb(new Error('something went wrong'));
        });
      };
      
      var error;
      
      before(function(done) {
        req.logout(function(err) {
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
      
      it('should clear user', function() {
        expect(req.user).to.be.null;
      });
      
      it('should clear serialized user', function() {
        expect(req.session['passport'].user).to.be.undefined;
      });
    });
    
    describe('existing session, but not passing a callback argument', function() {
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      var req = new Object();
      req.logout = request.logout;
      req._passport = {};
      req._passport.instance = passport;
      req._sessionManager = passport._sm;
      req.session = {};
      req.session['passport'] = {};
      req.session['passport'].user = '1';
      
      it('should throw an exception', function() {
        expect(function() {
          req.logout();
        }).to.throw(Error, 'req#logout requires a callback function');
      });
    });
    
    describe('without session support', function() {
      var passport = new Passport();
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      var req = new Object();
      req.logout = request.logout;
      req._passport = {};
      req._passport.instance = passport;
      req._sessionManager = passport._sm;
      
      var error;
      
      before(function(done) {
        req.logout(function(err) {
          error = err;
          done();
        });
      });
      
      it('should error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Login sessions require session support. Did you forget to use `express-session` middleware?');
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
      req._userProperty = 'currentUser';
      
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
