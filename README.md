# Feedbacker-Forum

## Setting up

The project is built using [Node.js][node], currently actively tested with version 10.13.

```bash
# Install the client and build the development bundle
cd client

npm install
npm run build:dev

# Build the node-runner image
cd ../docker
docker build -t node-runner node-runner

# If you want to build the proxy
cd ../proxy
go build

# Install the API server and run it
cd ../server

npm install
npm start
```

### Alternatively setting up docker container for dev environment

```bash

cd docker/development

docker-compose up --build
```

Now you can for example open http://localhost:8080/test.html to see the API in action.

## Getting started

For further documentation see [docs/getting-started.md](docs/getting-started.md).

[node]: https://nodejs.org/en/
