var chai = require('chai')
  , authenticateWith = require('../../lib/middleware/authenticateWith')
  , Passport = require('../..').Passport;

describe('middleware/authenticateWith', function() {

  describe('with configurator returning multiple strategies, the first of which succeeds', function() {
    function StrategyA() {
    }
    StrategyA.prototype.authenticate = function(req) {
      this.success({ username: 'bob-a' });
    };

    function StrategyB() {
    }
    StrategyB.prototype.authenticate = function(req) {
      this.success({ username: 'bob-b' });
    };

    var passport = new Passport();
    passport.use('a', new StrategyA());
    passport.use('b', new StrategyB());

    var request, error;

    function configurator(req, done) {
      return done(null, [ 'a', 'b' ]);
    }

    before(function(done) {
      chai.connect.use(authenticateWith(passport, configurator))
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

    it('should not error', function() {
      expect(error).to.be.undefined;
    });

    it('should set user', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.username).to.equal('bob-a');
    });
  });

  describe('with configurator returning multiple strategies, the second of which succeeds', function() {
    function StrategyA() {
    }
    StrategyA.prototype.authenticate = function(req) {
      this.fail('A challenge');
    };

    function StrategyB() {
    }
    StrategyB.prototype.authenticate = function(req) {
      this.success({ username: 'bob-b' });
    };

    var passport = new Passport();
    passport.use('a', new StrategyA());
    passport.use('b', new StrategyB());

    var request, error;

    function configurator(req, done) {
      return done(null, [ 'a', 'b' ]);
    }

    before(function(done) {
      chai.connect.use(authenticateWith(passport, configurator))
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

    it('should not error', function() {
      expect(error).to.be.undefined;
    });

    it('should set user', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.username).to.equal('bob-b');
    });
  });

  describe('with configurator returning multiple strategies directly, the first of which succeeds', function() {
    function StrategyA() {
    }
    StrategyA.prototype.authenticate = function(req) {
      this.success({ username: 'bob-a' });
    };

    function StrategyB() {
    }
    StrategyB.prototype.authenticate = function(req) {
      this.success({ username: 'bob-b' });
    };

    var passport = new Passport();

    var request, error;

    function configurator(req, done) {
      return done(null, [ new StrategyA(), new StrategyB() ]);
    }

    before(function(done) {
      chai.connect.use(authenticateWith(passport, configurator))
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

    it('should not error', function() {
      expect(error).to.be.undefined;
    });

    it('should set user', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.username).to.equal('bob-a');
    });
  });

  describe('with configurator returning multiple strategies directly, the second of which succeeds', function() {
    function StrategyA() {
    }
    StrategyA.prototype.authenticate = function(req) {
      this.fail('A challenge');
    };

    function StrategyB() {
    }
    StrategyB.prototype.authenticate = function(req) {
      this.success({ username: 'bob-b' });
    };

    var passport = new Passport();

    var request, error;

    function configurator(req, done) {
      return done(null, [ new StrategyA(), new StrategyB() ]);
    }

    before(function(done) {
      chai.connect.use(authenticateWith(passport, configurator))
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

    it('should not error', function() {
      expect(error).to.be.undefined;
    });

    it('should set user', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.username).to.equal('bob-b');
    });
  });
});
