var chai = require('chai');

chai.use(require('chai-connect-middleware'));
chai.use(require('chai-passport-strategy'));

global.$require = require('proxyquire');
global.expect = chai.expect;
