
# Getting started

## Repository structure

The repository contains multiple separate components.
The API server and web client are split into their own *npm* modules.
Dockerfiles for development and production are also provided.

## Client and server

All our JavaScript is written in modern ES6 and compiled using [Babel][babel].
This allows using the same set of features both on the frontend and backend.
We also lint the code using [ESLint][eslint] with the [Airbnb][gh-airbnb] style
guide with the exception of not using semicolons.
Both Babel `.babelrc` and ESLint `.eslintrc.json` configuration files are duplicated
in the *server/* and *client/* directories.

Both the client and server are continuously tested using [Travis CI][travis].
The Travis configuration `.travis.yml` is shared and located at the root.

## Client

## Server

## Docker

[travis]: https://travis-ci.org/
[babel]: https://babeljs.io/
[eslint]: https://eslint.org/
[gh-airbnb]: https://github.com/airbnb/javascript

