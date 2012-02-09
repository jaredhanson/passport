# Passport
[http://passportjs.org](http://passportjs.org)

Passport is an authentication framework for [Connect](http://senchalabs.github.com/connect/)
and [Express](http://expressjs.com/), which is extensible through "plugins"
known as _strategies_.

Passport is designed to be a general-purpose, yet simple, modular, and
unobtrusive, authentication framework.  Passport's sole purpose is to
authenticate requests.  In being modular, it doesn't force any particular
authentication strategy on your application.  In being unobtrusive, it doesn't
mount routes in your application.  The API is simple: you give Passport a
request to authenticate, and Passport provides hooks for controlling what occurs
when authentication succeeds or fails.

## Installation

    $ npm install passport

## Usage

#### Strategies

Passport uses the concept of strategies to authenticate requests.  Strategies
can range from verifying username and password credentials, delegated
authentication using [OAuth](http://oauth.net/) (for example, via [Facebook](http://www.facebook.com/)
or [Twitter](http://twitter.com/)), or federated authentication using [OpenID](http://openid.net/).

Before asking passport to authenticate a request, the strategy (or strategies)
used by an application must be configured.

    passport.use(new LocalStrategy(
      function(username, password, done) {
        User.findOne({ username: username, password: password }, function (err, user) {
          done(err, user);
        });
      }
    ));

#### Sessions

Passport will maintain persistent login sessions.  In order for persistent
sessions to work, the authenticated user must be serialized to the session, and
deserialized when subsequent requests are made.

Passport does not impose any restrictions on how your user records are stored.
Instead, you provide a function to Passport which implements the necessary
serialization and deserialization logic.  In typical applications, this will be
as simple as serializing the user ID, and finding the user by ID when
deserializing.

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      User.findById(id, function (err, user) {
        done(err, user);
      });
    });

#### Connect/Express Middleware

To use Passport in a [Connect](http://senchalabs.github.com/connect/) or
[Express](http://expressjs.com/)-based application, configure it with the
required `passport.initialize()` middleware.  If your applications uses
persistent login sessions (recommended, but not required), `passport.session()`
middleware must also be used.

    app.configure(function() {
      app.use(express.cookieParser());
      app.use(express.bodyParser());
      app.use(express.session({ secret: 'keyboard cat' }));
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(app.router);
      app.use(express.static(__dirname + '/../../public'));
    });

#### Authenticate Requests

Passport provides an `authenticate()` function (which is standard
Connect/Express middleware), which is utilized to authenticate requests.

For example, it can be used as route middleware in an Express application:

    app.post('/login', 
      passport.authenticate('local', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-local/tree/master/examples/login)
included in [Passport-Local](https://github.com/jaredhanson/passport-local).

## Strategies

<table>
  <thead>
    <tr><th>Strategy</th><th>Description</th><th>Developer</th></tr>
  </thead>
  <tbody>
    <tr><td><a href="https://github.com/jaredhanson/passport-local">Local</a></td><td>Local username and password authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-openid">OpenID</a></td><td>OpenID authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-oauth">OAuth</a></td><td>OAuth 1.0 and 2.0 authentication strategies.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-browserid">BrowserID</a></td><td>BrowserID authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-37signals">37signals</a></td><td>37signals authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-angellist">AngelList</a></td><td>AngelList authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-bitbucket">Bitbucket</a></td><td>Bitbucket authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-digg">Digg</a></td><td>Digg authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-dropbox">Dropbox</a></td><td>Dropbox authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-dwolla">Dwolla</a></td><td>Dwolla authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-evernote">Evernote</a></td><td>Evernote authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-facebook">Facebook</a></td><td>Facebook authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-fitbit">Fitbit</a></td><td>Fitbit authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/johnnyhalife/passport-flickr">Flickr</a></td><td>Flickr authentication strategy.</td><td><a href="https://github.com/johnnyhalife">Johnny Halife</a></td></tr>
    <tr><td><a href="https://github.com/joshbirk/passport-forcedotcom">Force.com</a></td><td>Force.com (Salesforce, Database.com) authentication strategy.</td><td><a href="https://github.com/joshbirk">Joshua Birk</a></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-foursquare">Foursquare</a></td><td>Foursquare authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-geoloqi">Geoloqi</a></td><td>Geoloqi authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-github">GitHub</a></td><td>GitHub authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-goodreads">Goodreads</a></td><td>Goodreads authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-google">Google</a></td><td>Google authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-google-oauth">Google</a> (OAuth)</td><td>Google (OAuth 1.0 and OAuth 2.0) authentication strategies.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-gowalla">Gowalla</a></td><td>Gowalla authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-instagram">Instagram</a></td><td>Instagram authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-justintv">Justin.tv</a></td><td>Justin.tv authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-linkedin">LinkedIn</a></td><td>LinkedIn authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-meetup">Meetup</a></td><td>Meetup authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-netflix">Netflix</a></td><td>Netflix authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-ohloh">Ohloh</a></td><td>Ohloh authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-openstreetmap">OpenStreetMap</a></td><td>OpenStreetMap authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-picplz">picplz</a></td><td>picplz authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-rdio">Rdio</a></td><td>Rdio authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-readability">Readability</a></td><td>Readability authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-runkeeper">RunKeeper</a></td><td>RunKeeper authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-smugmug">SmugMug</a></td><td>SmugMug authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-soundcloud">SoundCloud</a></td><td>SoundCloud authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/zoowar/passport-statusnet">StatusNet</a></td><td>StatusNet authentication strategy.</td><td><a href="https://github.com/zoowar">ZooWar</a></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-tripit">TripIt</a></td><td>TripIt authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-tumblr">Tumblr</a></td><td>Tumblr authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-twitter">Twitter</a></td><td>Twitter authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-vimeo">Vimeo</a></td><td>Vimeo authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-windowslive">Windows Live</a></td><td>Windows Live authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-yahoo">Yahoo!</a></td><td>Yahoo! authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-yahoo-oauth">Yahoo!</a> (OAuth)</td><td>Yahoo! (OAuth 1.0) authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-yammer">Yammer</a></td><td>Yammer authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-http">HTTP</a></td><td>HTTP Basic and Digest authentication strategies.</td><td></td></tr>
    <tr><td><a href="https://github.com/jaredhanson/passport-http-bearer">HTTP-Bearer</a></td><td>HTTP Bearer authentication strategy.</td><td></td></tr>
    <tr><td><a href="https://github.com/developmentseed/passport-dummy">Dummy</a></td><td>Dummy authentication strategy.</td><td><a href="https://github.com/developmentseed">Development Seed</a></td></tr>
  </tbody>
</table>

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/passport.png)](http://travis-ci.org/jaredhanson/passport)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

(The MIT License)

Copyright (c) 2011 Jared Hanson

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
