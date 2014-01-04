var chai = require('chai')
  , authenticate = require('../../lib/passport/middleware/authenticate');


describe('middleware/authenticate', function() {
  
  it('should be named authenticate', function() {
    expect(authenticate().name).to.equal('authenticate');
  });
  
});
