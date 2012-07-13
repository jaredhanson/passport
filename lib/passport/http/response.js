/**
 * Module dependencies.
 */
var http = require('http')
  , res = http.ServerResponse.prototype
  , statusCodes = http.STATUS_CODES;


/**
 * Redirect to the given `url` with optional response `status`
 * defaulting to 302.
 *
 * Examples:
 *
 *    res.redirect('/foo/bar');
 *    res.redirect('http://example.com');
 *    res.redirect(301, 'http://example.com');
 *    res.redirect('../login'); // /blog/post/1 -> /blog/login
 *
 * @param {Number} code
 * @param {String} url
 * @api public
 */

res.redirect = function(url){
  var app = this.app
    , status = 302;

  // allow status / url
  if (2 == arguments.length) {
    status = url;
    url = arguments[1];
  }

  body = statusCodes[status] + '. Redirecting to ' + url;

  // Respond
  this.statusCode = status;
  this.setHeader('Location', url);
  this.setHeader('Content-Length', Buffer.byteLength(body));
  this.end(body);
};

