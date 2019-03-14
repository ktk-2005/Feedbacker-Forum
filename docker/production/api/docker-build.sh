set -e
set -u

cp /prod/config.json /app/config.json

apk add --no-cache git build-base python

rm -rf node_modules/
npm install

npm uninstall node-sass && npm install node-sass --sass-binary-name=linux_musl-x64-64

mkdir -p build
node ../misc/dump-version.js > ./build/version.json
