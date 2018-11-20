#!/usr/bin/env bash

# Fail early
set -e
set -u

# Test server endpoints
npm --prefix server run test:remoteapi

# Download main bundle file and print size
mkdir -p build
curl -s localhost:$APP_SERVER_PORT/main.js > build/main.js
echo -n 'Bundle size: '; ls -lah build/main.js | awk -F " " {'print $5'}

