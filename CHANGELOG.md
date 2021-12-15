# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/jaredhanson/passport/compare/v0.5.1...HEAD
[0.5.1]: https://github.com/jaredhanson/passport/compare/v0.5.0...v0.5.1
