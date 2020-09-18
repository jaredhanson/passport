/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , authenticate = require('../../lib/middleware/authenticate')
  , Passport = require('../..').Passport;


describe('middleware/authenticate', function () {

  function Strategy() {
    this.authentications = []
  }
  Strategy.prototype.authenticate = function (req) {
    this.authentications.push({ self: this, req: req });
    if (this.authentications.length === 2) {
      for (var j = 0, len = this.authentications.length; j < len; j++) {
        var auth = this.authentications[j];
        auth.self.success(auth.req._user);
      }
    }
  };

  function testRun(passport, strategy) {
    var request = []
      , next = [];

    before(function (done) {
      function prepare(test) {
        test
          .req(function (req) {
            request.push(req);
            req._user = request.length;
          })
          .next(function () {
            next.push(test);
            if (next.length === 2) {
              done();
            }
          })
          .dispatch();
      };

      var middleware = authenticate(passport, strategy, { assignProperty: 'user' });
      prepare(chai.connect.use(middleware));
      prepare(chai.connect.use(middleware));
    });

    it('should complete different requests', function () {
      expect(next[0]).to.not.equal(next[1]);
    })
    it('should assign correct user to correct request', function () {
      expect(request[0].user).to.equal(request[0]._user);
      expect(request[1].user).to.equal(request[1]._user);
    })
  }

  describe('success two requests concurrently by name', function () {
    var passport = new Passport();
    passport.use('success', new Strategy());
    testRun(passport, 'success');
  });

  describe('success two requests concurrently by instance', function () {
    var passport = new Passport();
    testRun(passport, new Strategy());
  });

});
