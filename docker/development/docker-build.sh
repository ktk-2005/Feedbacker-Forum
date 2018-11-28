set -e
set -u

apk add --no-cache git

cd ../client

# Possibly something useful for dynamic pulling of version?
### Getting x86_64 => x64-64
# MACHINE_HARDWARE=`uname -m`
# linux_musl-${MACHINE_HARDWARE/86_/64-}

rm -rf node_modules
npm install

npm run build:dev

cd ../server

rm -rf node_modules
npm install
