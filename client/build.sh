#!/bin/sh

cp test.html build/index.html
webpack -p --mode production --config webpack.production.config.js
