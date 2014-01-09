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
  
});
