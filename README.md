<img src="http://passportjs.org/assets/images/logo-90px.png" align="right" />
# Passport

Passport is [Express](http://expressjs.com/)-compatible authentication
middleware for [Node.js](http://nodejs.org/).

Passport's sole purpose is to authenticate requests, which it does through an
extensible set of plugins known as _strategies_.  Passport does not mount
routes or assume any particular database schema, which maximizes flexiblity and
allows application-level decisions to be made by the developer.  The API is
simple: you provide Passport a request to authenticate, and Passport provides
hooks for controlling what occurs when authentication succeeds or fails.

## Install

    $ npm install passport

## Usage

#### Strategies

Passport uses the concept of strategies to authenticate requests.  Strategies
can range from verifying username and password credentials, delegated
authentication using [OAuth](http://oauth.net/) (for example, via [Facebook](http://www.facebook.com/)
or [Twitter](http://twitter.com/)), or federated authentication using [OpenID](http://openid.net/).

Before authenticating requests, the strategy (or strategies) used by an
application must be configured.

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
Instead, you provide functions to Passport which implements the necessary
serialization and deserialization logic.  In a typical application, this will be
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

#### Middleware

To use Passport in an [Express](http://expressjs.com/) or
[Connect](http://senchalabs.github.com/connect/)-based application, configure it
with the required `passport.initialize()` middleware.  If your application uses
persistent login sessions (recommended, but not required), `passport.session()`
middleware must also be used.

    app.configure(function() {
      app.use(express.static(__dirname + '/../../public'));
      app.use(express.cookieParser());
      app.use(express.bodyParser());
      app.use(express.session({ secret: 'keyboard cat' }));
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(app.router);
    });

#### Authenticate Requests

Passport provides an `authenticate()` function, which is used as route
middleware to authenticate requests.

    app.post('/login', 
      passport.authenticate('local', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-local/tree/master/examples/login)
included in [passport-local](https://github.com/jaredhanson/passport-local).

## Strategies

Passport has a comprehensive set of **over 120** authentication strategies
covering social networking, enterprise integration, API services, and more.
The [complete list](https://github.com/jaredhanson/passport/wiki/Strategies) is
available on the [wiki](https://github.com/jaredhanson/passport/wiki).

The following table lists commonly used strategies:

|Strategy                                                       | Protocol                 |Developer                                       |
|---------------------------------------------------------------|--------------------------|------------------------------------------------|
|[Local](https://github.com/jaredhanson/passport-local)         | HTML form                |[Jared Hanson](https://github.com/jaredhanson)  |
|[OpenID](https://github.com/jaredhanson/passport-openid)       | OpenID                   |[Jared Hanson](https://github.com/jaredhanson)  |
|[BrowserID](https://github.com/jaredhanson/passport-browserid) | BrowserID                |[Jared Hanson](https://github.com/jaredhanson)  |
|[Facebook](https://github.com/jaredhanson/passport-facebook)   | OAuth 2.0                |[Jared Hanson](https://github.com/jaredhanson)  |
|[Google](https://github.com/jaredhanson/passport-google)       | OpenID                   |[Jared Hanson](https://github.com/jaredhanson)  |
|[Google](https://github.com/jaredhanson/passport-google-oauth) | OAuth / OAuth 2.0        |[Jared Hanson](https://github.com/jaredhanson)  |
|[Twitter](https://github.com/jaredhanson/passport-twitter)     | OAuth                    |[Jared Hanson](https://github.com/jaredhanson)  |

## Related Modules

- [Locomotive](https://github.com/jaredhanson/locomotive) — Powerful MVC web framework
- [OAuthorize](https://github.com/jaredhanson/oauthorize) — OAuth service provider toolkit
- [OAuth2orize](https://github.com/jaredhanson/oauth2orize) — OAuth 2.0 authorization server toolkit
- [connect-ensure-login](https://github.com/jaredhanson/connect-ensure-login)  — middleware to ensure login sessions

The [modules](https://github.com/jaredhanson/passport/wiki/Modules) page on the
[wiki](https://github.com/jaredhanson/passport/wiki) lists other useful modules
that build upon or integrate with Passport.

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/passport.png)](http://travis-ci.org/jaredhanson/passport)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
