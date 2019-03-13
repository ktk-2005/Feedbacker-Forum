set -e
set -u

apk add --no-cache git curl libc6-compat build-base python

cd /app

mkdir -p build
curl https://dl.google.com/go/go1.11.linux-amd64.tar.gz -o build/go.tar.gz
tar -C build -xzf build/go.tar.gz

export GOROOT=/app/build/go
export PATH=/app/build/go/bin:$PATH

cd /app

cd proxy
/app/build/go/bin/go build
cd ..

cd client

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
