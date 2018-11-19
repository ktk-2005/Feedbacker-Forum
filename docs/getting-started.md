
# Getting started

## Repository structure

The repository contains multiple separate components.
The API server and web client are split into their own *npm* modules.
Dockerfiles for development and production are also provided.

Both the client and server are continuously tested using [Travis CI][travis].
The Travis configuration `.travis.yml` is shared and located at the root.
In the root there is a repo-wide `.editorconfig` file, set up [EditorConfig][editorconfig]
to keep the code style consistent (the linter should pick up most errors though).

## Client and server

All JavaScript is written in modern ES6 and compiled using [Babel][babel].
This allows using the same set of features both on the frontend and backend.
The code is linted using [ESLint][eslint] with the [Airbnb][gh-airbnb] style
guide with the exception of not using semicolons.
Both Babel `.babelrc` and ESLint `.eslintrc.json` configuration files are duplicated
in the *server/* and *client/* directories.

## Client

The frontend code and assets are bundled with [Webpack][webpack].
You can find separated development and production configuration files
under *client/webpack-config/*. The configuration is relatively standard, JS modules
are compiled from *client/src/* with polyfills to support down to IE11. Static assets
are copied from *client/static/*

## Server

## Docker

[travis]: https://travis-ci.org/
[babel]: https://babeljs.io/
[eslint]: https://eslint.org/
[gh-airbnb]: https://github.com/airbnb/javascript
[editorconfig]: https://editorconfig.org/
[webpack]: https://webpack.js.org/

