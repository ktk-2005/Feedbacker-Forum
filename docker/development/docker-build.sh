set -e
set -u

cd ../client

npm install 
npm run build:dev

cd ../server

npm install