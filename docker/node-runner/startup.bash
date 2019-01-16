#!/bin/bash

git clone $GIT_CLONE_URL /app
cd /app
git reset --hard $GIT_VERSION_HASH
npm install

npm run start
