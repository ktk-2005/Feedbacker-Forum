set -e
set -u

apk add --no-cache git

npm install

npm uninstall node-sass && npm install node-sass --sass-binary-name=linux_musl-x64-64

mkdir -p build
node ../misc/dump-version.js > ./build/version.json
