var util = require('util')
  , actions = require('../context/http/actions')
  , Context = require('../context/http/context')


// TODO: Implement support for authenticting with multiple strategies.
// TODO: Allow a callback to be passed to the set-up function
module.exports = function authenticate(strategy) {
  
  return function authenticate(req, res, next) {
    var passport = this;
    
    // Get the strategy, which will be used as prototype from which to create
    // a new instance.  Action functions will then be bound to the strategy
    // within the context of the HTTP request/response pair.
    var prototype = passport._strategy(strategy);
    var instance = Object.create(prototype);
    var context = new Context(passport, req, res, next);
    augment(instance, actions, context);
    
    applyStrategy(instance, req, res);
  }
}


function augment(strategy, actions, ctx) {
  for (var method in actions) {
    strategy[method] = actions[method].bind(ctx);
  }
}

function applyStrategy(strategy, req, res) {
  // apply strategy-specific middleware, if any
  var stack = strategy.middleware;
  (function pass(i, err) {
    if (err) { return strategy.error(err); }
      
    var layer = stack[i];
    if (!layer) {
      // middleware done, authenticate request
      return strategy.authenticate(req);
    }
      
    try {
      layer(req, res, function(e) { pass(i + 1, e); } )
    } catch (e) {
      return strategy.error(e);
    }
  })(0);
}
