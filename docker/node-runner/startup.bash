#!/bin/bash

set -xe

if [ ! -d "/app" ]; then
  git clone $GIT_CLONE_URL /app 
  cd /app
  git reset --hard $GIT_VERSION_HASH
  npm install
fi

cd /app
npm run start
