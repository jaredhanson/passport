var chai = require('chai')
  , Authenticator = require('..').Authenticator;


describe('Authenticator', function() {
  
  describe('#use', function() {
    
    describe('with instance name', function() {
      function Strategy() {
        this.name = 'default';
      }
      Strategy.prototype.authenticate = function(req) {
      }
      
      var authenticator = new Authenticator();
      authenticator.use(new Strategy());
      
      it('should register strategy', function() {
        expect(authenticator._strategies['default']).to.be.an('object');
      });
    });
    
    describe('with registered name', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
      }
      
      var authenticator = new Authenticator();
      authenticator.use('foo', new Strategy());
      
      it('should register strategy', function() {
        expect(authenticator._strategies['foo']).to.be.an('object');
      });
    });
    
    describe('with registered name overridding instance name', function() {
      function Strategy() {
        this.name = 'default';
      }
      Strategy.prototype.authenticate = function(req) {
      }
      
      var authenticator = new Authenticator();
      authenticator.use('bar', new Strategy());
      
      it('should register strategy', function() {
        expect(authenticator._strategies['bar']).to.be.an('object');
        expect(authenticator._strategies['default']).to.be.undefined;
      });
    });
    
    it('should throw if lacking a name', function() {
      function Strategy() {
      }
      Strategy.prototype.authenticate = function(req) {
      }
      
      expect(function() {
        var authenticator = new Authenticator();
        authenticator.use(new Strategy());
      }).to.throw(Error, 'authentication strategies must have a name');
    });
  });
  
  
  describe('#unuse', function() {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req) {
    }
    
    var authenticator = new Authenticator();
    authenticator.use('one', new Strategy());
    authenticator.use('two', new Strategy());
    
    expect(authenticator._strategies['one']).to.be.an('object');
    expect(authenticator._strategies['two']).to.be.an('object');
    
    authenticator.unuse('one');
      
    it('should unregister strategy', function() {
      expect(authenticator._strategies['one']).to.be.undefined;
      expect(authenticator._strategies['two']).to.be.an('object');
    });
  });
  
  
  describe('#serializeUser', function() {
    
    describe('without serializers', function() {
      var authenticator = new Authenticator();
      var error, obj;
    
      before(function(done) {
        authenticator.serializeUser({ id: '1', username: 'jared' }, function(err, o) {
          error = err;
          obj = o;
          done();
        });
      });
    
      it('should error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('failed to serialize user into session');
      });
      
      it('should not serialize user', function() {
        expect(obj).to.be.undefined;
      });
    });
    
    describe('with one serializer', function() {
      var authenticator = new Authenticator();
      authenticator.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      var error, obj;
    
      before(function(done) {
        authenticator.serializeUser({ id: '1', username: 'jared' }, function(err, o) {
          error = err;
          obj = o;
          done();
        });
      });
    
      it('should not error', function() {
        expect(error).to.be.null;
      });
      
      it('should serialize user', function() {
        expect(obj).to.equal('1');
      });
    });
    
    describe('with one serializer that serializes to 0', function() {
      var authenticator = new Authenticator();
      authenticator.serializeUser(function(user, done) {
        done(null, 0);
      });
      
      var error, obj;
    
      before(function(done) {
        authenticator.serializeUser({ id: '1', username: 'jared' }, function(err, o) {
          error = err;
          obj = o;
          done();
        });
      });
    
      it('should not error', function() {
        expect(error).to.be.null;
      });
      
      it('should serialize user', function() {
        expect(obj).to.equal(0);
      });
    });
    
    describe('with one serializer that serializes to false', function() {
      var authenticator = new Authenticator();
      authenticator.serializeUser(function(user, done) {
        done(null, false);
      });
      
      var error, obj;
    
      before(function(done) {
        authenticator.serializeUser({ id: '1', username: 'jared' }, function(err, o) {
          error = err;
          obj = o;
          done();
        });
      });
    
      it('should error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('failed to serialize user into session');
      });
      
      it('should not serialize user', function() {
        expect(obj).to.be.undefined;
      });
    });
    
    describe('with one serializer that serializes to null', function() {
      var authenticator = new Authenticator();
      authenticator.serializeUser(function(user, done) {
        done(null, null);
      });
      
      var error, obj;
    
      before(function(done) {
        authenticator.serializeUser({ id: '1', username: 'jared' }, function(err, o) {
          error = err;
          obj = o;
          done();
        });
      });
    
      it('should error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('failed to serialize user into session');
      });
      
      it('should not serialize user', function() {
        expect(obj).to.be.undefined;
      });
    });
    
    describe('with one serializer that serializes to undefined', function() {
      var authenticator = new Authenticator();
      authenticator.serializeUser(function(user, done) {
        done(null, undefined);
      });
      
      var error, obj;
    
      before(function(done) {
        authenticator.serializeUser({ id: '1', username: 'jared' }, function(err, o) {
          error = err;
          obj = o;
          done();
        });
      });
    
      it('should error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('failed to serialize user into session');
      });
      
      it('should not serialize user', function() {
        expect(obj).to.be.undefined;
      });
    });
    
    describe('with one serializer that throws an exception', function() {
      var authenticator = new Authenticator();
      authenticator.serializeUser(function(user, done) {
        throw new Error('something went horribly wrong');
      });
      
      var error, obj;
    
      before(function(done) {
        authenticator.serializeUser({ id: '1', username: 'jared' }, function(err, o) {
          error = err;
          obj = o;
          done();
        });
      });
    
      it('should error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('something went horribly wrong');
      });
      
      it('should not serialize user', function() {
        expect(obj).to.be.undefined;
      });
    });
    
    describe('with three serializers, the first of which passes and the second of which serializes', function() {
      var authenticator = new Authenticator();
      authenticator.serializeUser(function(user, done) {
        done('pass');
      });
      authenticator.serializeUser(function(user, done) {
        done(null, 'two');
      });
      authenticator.serializeUser(function(user, done) {
        done(null, 'three');
      });
      
      var error, obj;
    
      before(function(done) {
        authenticator.serializeUser({ id: '1', username: 'jared' }, function(err, o) {
          error = err;
          obj = o;
          done();
        });
      });
    
      it('should not error', function() {
        expect(error).to.be.null;
      });
      
      it('should serialize user', function() {
        expect(obj).to.equal('two');
      });
    });
    
  });
  
  
  describe('#deserializeUser', function() {
    
    describe('without deserializers', function() {
      var authenticator = new Authenticator();
      var error, user;
    
      before(function(done) {
        authenticator.deserializeUser({ id: '1', username: 'jared' }, function(err, u) {
          error = err;
          user = u;
          done();
        });
      });
    
      it('should error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('failed to deserialize user out of session');
      });
      
      it('should not deserialize user', function() {
        expect(user).to.be.undefined;
      });
    });
    
    describe('with one deserializer', function() {
      var authenticator = new Authenticator();
      authenticator.deserializeUser(function(obj, done) {
        done(null, obj.username);
      });
      
      var error, user;
    
      before(function(done) {
        authenticator.deserializeUser({ id: '1', username: 'jared' }, function(err, u) {
          error = err;
          user = u;
          done();
        });
      });
    
      it('should not error', function() {
        expect(error).to.be.null;
      });
      
      it('should deserialize user', function() {
        expect(user).to.equal('jared');
      });
    });
    
    describe('with one deserializer that deserializes to false', function() {
      var authenticator = new Authenticator();
      authenticator.deserializeUser(function(obj, done) {
        done(null, false);
      });
      
      var error, user;
    
      before(function(done) {
        authenticator.deserializeUser({ id: '1', username: 'jared' }, function(err, u) {
          error = err;
          user = u;
          done();
        });
      });
    
      it('should not error', function() {
        expect(error).to.be.null;
      });
      
      it('should invalidate session', function() {
        expect(user).to.be.false;
      });
    });
    
    describe('with one deserializer that deserializes to null', function() {
      var authenticator = new Authenticator();
      authenticator.deserializeUser(function(obj, done) {
        done(null, null);
      });
      
      var error, user;
    
      before(function(done) {
        authenticator.deserializeUser({ id: '1', username: 'jared' }, function(err, u) {
          error = err;
          user = u;
          done();
        });
      });
    
      it('should not error', function() {
        expect(error).to.be.null;
      });
      
      it('should invalidate session', function() {
        expect(user).to.be.false;
      });
    });
    
    describe('with one deserializer that deserializes to undefined', function() {
      var authenticator = new Authenticator();
      authenticator.deserializeUser(function(obj, done) {
        done(null, undefined);
      });
      
      var error, user;
    
      before(function(done) {
        authenticator.deserializeUser({ id: '1', username: 'jared' }, function(err, u) {
          error = err;
          user = u;
          done();
        });
      });
    
      it('should error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('failed to deserialize user out of session');
      });
      
      it('should not deserialize user', function() {
        expect(user).to.be.undefined;
      });
    });
    
    describe('with three deserializers, the first of which passes and the second of which deserializes', function() {
      var authenticator = new Authenticator();
      authenticator.deserializeUser(function(obj, done) {
        done('pass');
      });
      authenticator.deserializeUser(function(obj, done) {
        done(null, 'two');
      });
      authenticator.deserializeUser(function(obj, done) {
        done(null, 'three');
      });
      
      var error, user;
    
      before(function(done) {
        authenticator.deserializeUser({ id: '1', username: 'jared' }, function(err, u) {
          error = err;
          user = u;
          done();
        });
      });
    
      it('should not error', function() {
        expect(error).to.be.null;
      });
      
      it('should deserialize user', function() {
        expect(user).to.equal('two');
      });
    });
    
    describe('with three deserializers, the first of which passes and the second of which does not deserialize by no argument', function() {
      var authenticator = new Authenticator();
      authenticator.deserializeUser(function(obj, done) {
        done('pass');
      });
      authenticator.deserializeUser(function(obj, done) {
        done(null);
      });
      authenticator.deserializeUser(function(obj, done) {
        done(null, 'three');
      });
      
      var error, user;
    
      before(function(done) {
        authenticator.deserializeUser({ id: '1', username: 'jared' }, function(err, u) {
          error = err;
          user = u;
          done();
        });
      });
    
      it('should not error', function() {
        expect(error).to.be.null;
      });
      
      it('should deserialize user', function() {
        expect(user).to.equal('three');
      });
    });
    
    describe('with three deserializers, the first of which passes and the second of which does not deserialize by undefined', function() {
      var authenticator = new Authenticator();
      authenticator.deserializeUser(function(obj, done) {
        done('pass');
      });
      authenticator.deserializeUser(function(obj, done) {
        done(null, undefined);
      });
      authenticator.deserializeUser(function(obj, done) {
        done(null, 'three');
      });
      
      var error, user;
    
      before(function(done) {
        authenticator.deserializeUser({ id: '1', username: 'jared' }, function(err, u) {
          error = err;
          user = u;
          done();
        });
      });
    
      it('should not error', function() {
        expect(error).to.be.null;
      });
      
      it('should deserialize user', function() {
        expect(user).to.equal('three');
      });
    });
    
    describe('with three deserializers, the first of which passes and the second of which invalidates session by false', function() {
      var authenticator = new Authenticator();
      authenticator.deserializeUser(function(obj, done) {
        done('pass');
      });
      authenticator.deserializeUser(function(obj, done) {
        done(null, false);
      });
      authenticator.deserializeUser(function(obj, done) {
        done(null, 'three');
      });
      
      var error, user;
    
      before(function(done) {
        authenticator.deserializeUser({ id: '1', username: 'jared' }, function(err, u) {
          error = err;
          user = u;
          done();
        });
      });
    
      it('should not error', function() {
        expect(error).to.be.null;
      });
      
      it('should invalidate session', function() {
        expect(user).to.be.false;
      });
    });
    
    describe('with three deserializers, the first of which passes and the second of which invalidates session by null', function() {
      var authenticator = new Authenticator();
      authenticator.deserializeUser(function(obj, done) {
        done('pass');
      });
      authenticator.deserializeUser(function(obj, done) {
        done(null, null);
      });
      authenticator.deserializeUser(function(obj, done) {
        done(null, 'three');
      });
      
      var error, user;
    
      before(function(done) {
        authenticator.deserializeUser({ id: '1', username: 'jared' }, function(err, u) {
          error = err;
          user = u;
          done();
        });
      });
    
      it('should not error', function() {
        expect(error).to.be.null;
      });
      
      it('should invalidate session', function() {
        expect(user).to.be.false;
      });
    });
    
  });
  
});
