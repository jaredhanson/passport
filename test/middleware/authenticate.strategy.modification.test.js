/* global describe, it, expect, before */

/*
These tests validate that when authenticate(passport, strategy) is called, the
strategy object is not modified. (The authenticate function should copy the object using Object.create())

Scenarios:
| # | strategy param | use called | description                                                                                    |
| 1 | string         | true       | authenticate called, passing strategy as a string                                              |
| 2 | object         | true       | authenticate called, passing strategy as an object                                             |
| 3 | objeect        | false      | authenticate called, passing strategy as an object, without calling passport.use() on strategy |

Validations:
    strategy.authenticate should not be modified
    if set by strategy constructor, strategy.name should not be modified
    strategy.success should not be modified/defined
    strategy.fail should not be modified/defined
    strategy.redirect should not be modified/defined
    strategy.pass should not be modified/defined
    strategy.error should not be modified/defined
*/

var chai = require('chai')
  , authenticate = require('../../lib/middleware/authenticate')
  , Passport = require('../..').Passport;

  describe('middleware/authenticate', function(){
    describe('when called, passing strategy as a string', function(){
  
      function Strategy() {
      }
      var authenticateFunc;
      Strategy.prototype.authenticate = authenticateFunc = function(req) {
        var user = { id: '1', username: 'jaredhanson' };
        this.success(user);
      };
  
      const strategy = new Strategy();
  
      var passport = new Passport();
  
      passport.use('strategy', strategy)
      
      var request, error;
  
      before(function(done) {
        chai.connect.use(authenticate(passport, 'strategy'))
          .req(function(req) {
            request = req;
            req.logIn = function(user, options, done) {
              this.user = user;
              done();
            };
          })
          .next(function(err) {
            error = err;
            done();
          })
          .dispatch();
      });
      
      it('should not modify the strategy', function(){
        expect(strategy.authenticate).to.equal(authenticateFunc);
        expect(strategy.success).to.be.undefined
        expect(strategy.fail).to.be.undefined
        expect(strategy.redirect).to.be.undefined
        expect(strategy.pass).to.be.undefined
        expect(strategy.error).to.be.undefined
      });
    })

    describe('when called, passing strategy as an object', function(){
  
        function Strategy() {
            this.name = 'strategy'
        }
        var authenticateFunc;
        Strategy.prototype.authenticate = authenticateFunc = function(req) {
          var user = { id: '1', username: 'jaredhanson' };
          this.success(user);
        };
    
        const strategy = new Strategy();

        const strategyName = strategy.name
    
        var passport = new Passport();
    
        passport.use(strategy)
        
        var request, error;
    
        before(function(done) {
          chai.connect.use(authenticate(passport, strategy))
            .req(function(req) {
              request = req;
              req.logIn = function(user, options, done) {
                this.user = user;
                done();
              };
            })
            .next(function(err) {
              error = err;
              done();
            })
            .dispatch();
        });
        
        it('should not modify the strategy', function(){
          expect(strategy.authenticate).to.equal(authenticateFunc);
          expect(strategy.name).to.equal(strategyName);
          expect(strategy.success).to.be.undefined
          expect(strategy.fail).to.be.undefined
          expect(strategy.redirect).to.be.undefined
          expect(strategy.pass).to.be.undefined
          expect(strategy.error).to.be.undefined
        });
      })

      describe('when called, passing strategy as an object, without calling passport.use() on strategy', function(){
  
        function Strategy() {
        }
        var authenticateFunc;
        Strategy.prototype.authenticate = authenticateFunc = function(req) {
          var user = { id: '1', username: 'jaredhanson' };
          this.success(user);
        };
    
        const strategy = new Strategy();
    
        var passport = new Passport();
        
        var request, error;
    
        before(function(done) {
          chai.connect.use(authenticate(passport, strategy))
            .req(function(req) {
              request = req;
              req.logIn = function(user, options, done) {
                this.user = user;
                done();
              };
            })
            .next(function(err) {
              error = err;
              done();
            })
            .dispatch();
        });
        
        it('should not modify the strategy', function(){
          expect(strategy.authenticate).to.equal(authenticateFunc);
          expect(strategy.success).to.be.undefined
          expect(strategy.fail).to.be.undefined
          expect(strategy.redirect).to.be.undefined
          expect(strategy.pass).to.be.undefined
          expect(strategy.error).to.be.undefined
        });
      })
  });
  