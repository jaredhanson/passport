/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai');
var EventEmitter = require('events').EventEmitter;
var SessionStrategy = require('../../lib/strategies/session');


describe('SessionStrategy', function() {

  describe('handling a request with a login session, pausing for deserialization', function() {
    var strategy = new SessionStrategy(function(user, req, done) {
      done(null, { id: user });
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
          // pauseStream calls req.on/removeListener/emit — wire up an EventEmitter
          var ee = new EventEmitter();
          req.on = ee.on.bind(ee);
          req.removeListener = ee.removeListener.bind(ee);
          req.emit = ee.emit.bind(ee);

          req._passport = {};
          req._passport.instance = {};
          req.session = {};
          req.session['passport'] = {};
          req.session['passport'].user = '123456';
        })
        .authenticate({ pauseStream: true });
    });

    it('should pass', function() {
      expect(pass).to.be.true;
    });

    it('should set user on request', function() {
      expect(request.user).to.be.an('object');
      expect(request.user.id).to.equal('123456');
    });

    it('should maintain session', function() {
      expect(request.session['passport']).to.be.an('object');
      expect(request.session['passport'].user).to.equal('123456');
    });
  });

  describe('handling a request with a login session that has been invalidated, pausing for deserialization', function() {
    var strategy = new SessionStrategy(function(user, req, done) {
      done(null, false);
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
          var ee = new EventEmitter();
          req.on = ee.on.bind(ee);
          req.removeListener = ee.removeListener.bind(ee);
          req.emit = ee.emit.bind(ee);

          req._passport = {};
          req._passport.instance = {};
          req.session = {};
          req.session['passport'] = {};
          req.session['passport'].user = '123456';
        })
        .authenticate({ pauseStream: true });
    });

    it('should pass', function() {
      expect(pass).to.be.true;
    });

    it('should not set user on request', function() {
      expect(request.user).to.be.undefined;
    });

    it('should remove user from session', function() {
      expect(request.session['passport']).to.be.an('object');
      expect(request.session['passport'].user).to.be.undefined;
    });
  });

  describe('buffering and replaying stream events when pauseStream is true', function() {
    var replayedData = [];
    var replayedEnd = false;

    before(function(done) {
      var ee = new EventEmitter();

      // Register listeners INSIDE deserializeUser, after events are emitted.
      // pauseStream buffers the emits; resume() replays them to these listeners.
      var strategy = new SessionStrategy(function(user, req, cb) {
        req.emit('data', 'buffered-chunk');
        req.emit('end');

        req.on('data', function(chunk) { replayedData.push(chunk); });
        req.on('end', function() { replayedEnd = true; });

        cb(null, { id: user });
      });

      chai.passport.use(strategy)
        .pass(function() { done(); })
        .req(function(req) {
          req.on = ee.on.bind(ee);
          req.removeListener = ee.removeListener.bind(ee);
          req.emit = ee.emit.bind(ee);
          req._passport = {};
          req._passport.instance = {};
          req.session = { passport: { user: 'test' } };
        })
        .authenticate({ pauseStream: true });
    });

    it('should replay buffered data events to later-registered listeners', function() {
      expect(replayedData).to.deep.equal(['buffered-chunk']);
    });

    it('should replay buffered end event to later-registered listeners', function() {
      expect(replayedEnd).to.be.true;
    });
  });

});
