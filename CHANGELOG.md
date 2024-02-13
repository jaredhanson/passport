# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.0] - 2023-11-27
### Changed
- Set `req.authInfo` by default when using the `assignProperty` option to
`authenticate()` middleware.  This makes the behavior the same as when not using
the option, and can be disabled by setting `authInfo` option to `false`.

## [0.6.0] - 2022-05-20
### Added
- `authenticate()`, `req#login`, and `req#logout` accept a
`keepSessionInfo: true` option to keep session information after regenerating
the session.

### Changed

- `req#login()` and `req#logout()` regenerate the the session and clear session
information by default.
- `req#logout()` is now an asynchronous function and requires a callback
function as the last argument.

### Security

- Improved robustness against session fixation attacks in cases where there is
physical access to the same system or the application is susceptible to
cross-site scripting (XSS).

## [0.5.3] - 2022-05-16
### Fixed

- `initialize()` middleware extends request with `login()`, `logIn()`,
`logout()`, `logOut()`, `isAuthenticated()`, and `isUnauthenticated()` functions
again, reverting change from 0.5.1.

## [0.5.2] - 2021-12-16
### Fixed
- Introduced a compatibility layer for strategies that depend directly on
`passport@0.4.x` or earlier (such as `passport-azure-ad`), which were
broken by the removal of private variables in `passport@0.5.1`.

## [0.5.1] - 2021-12-15
### Added
- Informative error message in session strategy if session support is not
available.

### Changed

- `authenticate()` middleware, rather than `initialize()` middleware, extends
request with `login()`, `logIn()`, `logout()`, `logOut()`, `isAuthenticated()`,
and `isUnauthenticated()` functions.

## [0.5.0] - 2021-09-23
### Changed

- `initialize()` middleware extends request with `login()`, `logIn()`,
`logout()`, `logOut()`, `isAuthenticated()`, and `isUnauthenticated()`
functions.

### Removed

- `login()`, `logIn()`, `logout()`, `logOut()`, `isAuthenticated()`, and
`isUnauthenticated()` functions no longer added to `http.IncomingMessage.prototype`.

### Fixed

- `userProperty` option to `initialize()` middleware only affects the current
request, rather than all requests processed via singleton Passport instance,
eliminating a race condition in situations where `initialize()` middleware is
used multiple times in an application with `userProperty` set to different
values.

[Unreleased]: https://github.com/jaredhanson/passport/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/jaredhanson/passport/compare/v0.5.3...v0.6.0
[0.5.3]: https://github.com/jaredhanson/passport/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/jaredhanson/passport/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/jaredhanson/passport/compare/v0.5.0...v0.5.1
