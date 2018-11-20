set -e
set -u

apk add --no-cache git

cd ../client

npm install
npm run build:dev

cd ../server

npm install
