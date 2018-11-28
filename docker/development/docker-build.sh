set -e
set -u

apk add --no-cache git

cd ../client

# Possibly something useful for dynamic pulling of version?
### Getting x86_64 => x64-64
# MACHINE_HARDWARE=`uname -m`
# linux_musl-${MACHINE_HARDWARE/86_/64-}

npm install

npm uninstall node-sass && npm install node-sass --sass-binary-name=linux_musl-x64-64

npm run build:dev

cd ../server

npm install
