/* global describe, it, expect, before */
/* jshint expr: true, sub: true */

var Authenticator = require('../lib/authenticator');

describe('Authenticator', function() {

  describe('#serializeUser', function() {

    describe('with one generator serializer that serializes to false', function () {
      var authenticator = new Authenticator();
      authenticator.serializeUser(function*(user, done) {
        return false;
      });

      var error, obj;

      before(function (done) {
        authenticator.serializeUser({ id: '1', username: 'jared' }, function (err, o) {
          error = err;
          obj = o;
          done();
        });
      });

      it('should error', function () {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Failed to serialize user into session');
      });

      it('should not serialize user', function () {
        expect(obj).to.be.undefined;
      });
    });

    describe('with one generator serializer that throws an exception', function () {
      var authenticator = new Authenticator();
      authenticator.serializeUser(function*(user, done) {
        throw new Error('something went horribly wrong');
      });

      var error, obj;

      before(function (done) {
        authenticator.serializeUser({ id: '1', username: 'jared' }, function (err, o) {
          error = err;
          obj = o;
          done();
        });
      });

      it('should error', function () {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('something went horribly wrong');
      });

      it('should not serialize user', function () {
        expect(obj).to.be.undefined;
      });
    });

  });


  describe('#deserializeUser', function() {

    describe('with one generator function deserializer', function() {
      var authenticator = new Authenticator();
      authenticator.deserializeUser(function*(obj) {
        return obj.username;
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

    describe('with one generator function deserializer that throws an exception', function() {
      var authenticator = new Authenticator();
      authenticator.deserializeUser(function*(obj) {
        throw new Error('something went horribly wrong');
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
        expect(error.message).to.equal('something went horribly wrong');
      });

      it('should invalidate session', function() {
        expect(user).to.be.undefined;
      });
    });

  });


  describe('#transformAuthInfo', function() {

    describe('with one generator function transform', function() {
      var authenticator = new Authenticator();
      authenticator.transformAuthInfo(function*(info) {
        return { clientId: info.clientId, client: { name: 'Foo' }};
      });

      var error, obj;

      before(function(done) {
        authenticator.transformAuthInfo({ clientId: '1', scope: 'write' }, function(err, o) {
          error = err;
          obj = o;
          done();
        });
      });

      it('should not error', function() {
        expect(error).to.be.null;
      });

      it('should not transform info', function() {
        expect(Object.keys(obj)).to.have.length(2);
        expect(obj.clientId).to.equal('1');
        expect(obj.client.name).to.equal('Foo');
        expect(obj.scope).to.be.undefined;
      });
    });

    describe('with one generator transform function that encounters an error', function() {
      var authenticator = new Authenticator();
      authenticator.transformAuthInfo(function*(info) {
        throw new Error('something went wrong');
      });

      var error, obj;

      before(function(done) {
        authenticator.transformAuthInfo({ clientId: '1', scope: 'write' }, function(err, o) {
          error = err;
          obj = o;
          done();
        });
      });

      it('should error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('something went wrong');
      });

      it('should not transform info', function() {
        expect(obj).to.be.undefined;
      });
    });

  });

});
