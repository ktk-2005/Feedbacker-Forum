# Feedbacker-Forum

## Setting up

```bash
# Install the client and build the development bundle
cd client

npm install
npm run build:dev

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

To get an overview of the repository see [docs/getting-started.md](docs/getting-started.md).

