#!/bin/bash

set -xe

if [ -d "/app" ]; then
  cd /app
  npm run start
  exit
fi

git clone $GIT_CLONE_URL /app
cd /app
git reset --hard $GIT_VERSION_HASH
npm install

npm run start
