/* global describe, it, expect, before */
/* jshint expr: true, sub: true */

const { expect } = require('chai');
const { assert } = require('console');
const { IncomingMessage } = require('http');
var SessionManager = require('../lib/sessionmanager');

describe('SessionManager', function() {
    describe('#regenerate', function() {
        describe('with delegate for request object', function() {   

          it('should not throw an error if used as is', function() {
            var sm = new SessionManager({ key: 'test-key' }, function(fn, req, done){});
            var user = {name: 'test user'};
            const req = new IncomingMessage();
            req.session = {};
            sm.logIn(req, user, {}, function(err){
              expect(err).to.be.null;
            });
          });

          it('should call save and regenerate on delegate with an IncomingMessage when calling logIn', function() {
            var sm = new SessionManager({ key: 'test-key' , delegate: {
              save(req, cb){
                expect(req).to.be.instanceOf(IncomingMessage);
                cb()
              },
              regenerate(req, cb){
                expect(req).to.be.instanceOf(IncomingMessage);
                cb()
              }
            }}, function(fn, req, done){
              done()
            });

            var user = {name: 'test user'};
            const req = new IncomingMessage();
            req.session = {};
            sm.logIn(req, user, {}, function(err){
              expect(err).to.be.undefined;
            });
          });

          it('should call save and regenerate on delegate with an IncomingMessage when calling logOut', function() {
            var sm = new SessionManager({ key: 'test-key' , delegate: {
              save(req, cb){
                expect(req).to.be.instanceOf(IncomingMessage);
                cb()
              },
              regenerate(req, cb){
                expect(req).to.be.instanceOf(IncomingMessage);
                cb()
              }
            }}, function(fn, req, done){
              done()
            });

            var user = {name: 'test user'};
            const req = new IncomingMessage();
            req.session = {};
            sm.logOut(req, user, function(err){
              expect(err).to.be.undefined;
            });
          });

        });
    });    
});