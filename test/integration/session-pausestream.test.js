'use strict';

var express = require('express');
var session = require('express-session');
var request = require('supertest');
var Passport = require('../..').Passport;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPassport() {
  var p = new Passport();
  p.serializeUser(function(user, done) { done(null, user.id); });
  p.deserializeUser(function(id, done) {
    // Simulate async work (e.g. a DB lookup) so that HTTP data events
    // have a chance to fire during the deserialization window.
    setImmediate(function() { done(null, { id: id, name: 'Test User' }); });
  });
  return p;
}

function buildApp(opts) {
  opts = opts || {};
  var p = buildPassport();
  var app = express();

  app.use(session({ secret: 'integration-test', resave: false, saveUninitialized: false }));
  app.use(p.initialize());
  app.use(p.authenticate('session', opts.pauseStream ? { pauseStream: true } : {}));

  app.post('/login', function(req, res, next) {
    req.logIn({ id: 'user1' }, function(err) {
      if (err) { return next(err); }
      res.json({ ok: true });
    });
  });

  app.get('/me', function(req, res) {
    res.json(req.user || null);
  });

  // Middleware that collects raw stream chunks via on('data').
  // This simulates the original pauseStream use case: downstream code that
  // registers event listeners on req *after* passport has run.
  app.post('/echo-raw', function(req, res) {
    var chunks = [];
    req.on('data', function(chunk) { chunks.push(chunk); });
    req.on('end', function() {
      res.json({ body: Buffer.concat(chunks).toString() });
    });
  });

  return app;
}

// ---------------------------------------------------------------------------
// Suite 1: Basic session flow (no pauseStream)
// ---------------------------------------------------------------------------

describe('integration: session strategy without pauseStream', function() {
  var agent;
  before(function() { agent = request.agent(buildApp()); });

  it('returns null for unauthenticated /me', function(done) {
    agent.get('/me').expect(200).expect(function(res) {
      if (res.body !== null) throw new Error('expected null, got ' + JSON.stringify(res.body));
    }).end(done);
  });

  it('establishes a session via /login', function(done) {
    agent.post('/login').expect(200).expect({ ok: true }).end(done);
  });

  it('restores user from session on subsequent request', function(done) {
    agent.get('/me').expect(200).expect(function(res) {
      if (!res.body || res.body.id !== 'user1') {
        throw new Error('expected user1, got ' + JSON.stringify(res.body));
      }
    }).end(done);
  });
});

// ---------------------------------------------------------------------------
// Suite 2: Session flow with pauseStream: true
// ---------------------------------------------------------------------------

describe('integration: session strategy with pauseStream: true', function() {
  var agent;
  before(function() { agent = request.agent(buildApp({ pauseStream: true })); });

  it('returns null for unauthenticated /me', function(done) {
    agent.get('/me').expect(200).expect(function(res) {
      if (res.body !== null) throw new Error('expected null, got ' + JSON.stringify(res.body));
    }).end(done);
  });

  it('establishes a session via /login', function(done) {
    agent.post('/login').expect(200).expect({ ok: true }).end(done);
  });

  it('restores user from session on subsequent request', function(done) {
    agent.get('/me').expect(200).expect(function(res) {
      if (!res.body || res.body.id !== 'user1') {
        throw new Error('expected user1, got ' + JSON.stringify(res.body));
      }
    }).end(done);
  });
});

// ---------------------------------------------------------------------------
// Suite 3: pauseStream buffers and replays raw stream events
//
// The original motivation for pauseStream (passport/pull/106): downstream
// middleware that registers on('data') listeners *after* passport runs can
// still receive data events that fired during async deserialization.
//
// Note: pipe()-based body parsers (e.g. express.urlencoded) read from the
// stream's internal buffer rather than EventEmitter events, so they are not
// affected by — and do not benefit from — pauseStream.
// ---------------------------------------------------------------------------

describe('integration: pauseStream buffers and replays stream events to on(data) listeners', function() {
  var agent;
  before(function(done) {
    agent = request.agent(buildApp({ pauseStream: true }));
    agent.post('/login').end(done);
  });

  it('replays body data to on(data) listeners registered after passport', function(done) {
    agent.post('/echo-raw')
      .type('form')
      .send({ message: 'hello', value: '42' })
      .expect(200)
      .expect(function(res) {
        if (!res.body.body) {
          throw new Error('body was empty: ' + JSON.stringify(res.body));
        }
        if (res.body.body.indexOf('message=hello') === -1) {
          throw new Error('expected message=hello in body, got: ' + res.body.body);
        }
        if (res.body.body.indexOf('value=42') === -1) {
          throw new Error('expected value=42 in body, got: ' + res.body.body);
        }
      })
      .end(done);
  });

  it('replays body correctly for multiple sequential requests', function(done) {
    agent.post('/echo-raw')
      .type('form')
      .send({ counter: '1' })
      .expect(200)
      .expect(function(res) {
        if (!res.body.body || res.body.body.indexOf('counter=1') === -1) {
          throw new Error('expected counter=1, got: ' + JSON.stringify(res.body));
        }
      })
      .end(function() {
        agent.post('/echo-raw')
          .type('form')
          .send({ counter: '2' })
          .expect(200)
          .expect(function(res) {
            if (!res.body.body || res.body.body.indexOf('counter=2') === -1) {
              throw new Error('expected counter=2, got: ' + JSON.stringify(res.body));
            }
          })
          .end(done);
      });
  });

  it('does not corrupt body for an unauthenticated request (pauseStream inactive)', function(done) {
    // Fresh agent — no session cookie, so deserializeUser is never called
    // and pauseStream is a no-op. Verify the body still arrives correctly.
    request(buildApp({ pauseStream: true }))
      .post('/echo-raw')
      .type('form')
      .send({ message: 'unauthenticated' })
      .expect(200)
      .expect(function(res) {
        if (!res.body.body || res.body.body.indexOf('message=unauthenticated') === -1) {
          throw new Error('unauthenticated body corrupted: ' + JSON.stringify(res.body));
        }
      })
      .end(done);
  });
});
