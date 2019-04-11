#!/bin/bash

set -xe

if [ ! -d "/app" ]; then
  git clone $GIT_CLONE_URL /app
  git -C /app reset --hard $GIT_VERSION_HASH
  npm install --prefix /app
fi

cd /app
npm run start
