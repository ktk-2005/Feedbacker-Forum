set -e
set -u

apk add --no-cache git

npm install

mkdir -p build
node ../misc/dump-version.js > ./build/version.json

