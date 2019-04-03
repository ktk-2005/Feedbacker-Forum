# Feedbacker-Forum &middot; [![Build Status](https://travis-ci.org/ktk-2005/Feedbacker-Forum.svg?branch=develop)](https://travis-ci.org/ktk-2005/Feedbacker-Forum) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

 // Motivation from product vision //

## Setting up

The project consist of a frontend, backend, proxy and database. The different parts can either be setup manually, or run together using containers.

## Prerequisites

The project is built using [Node.js][node], currently actively tested with version 10.13.
The project also requires [go][golang] version 1.11 for running the proxy.
Instances are run in containers with [docker][docker].

If the project is run with containers [docker-compose][docker-compose] is also required for orchestrating the containers.

The simple manual setup requires the following steps. Further run configurations can be found in [docs/getting-started.md](docs/getting-started.md).

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

## Contributing

Changes or additions can be proposed by creating issues or pull requests on github. Running a local development version can be setup as seen in [Setting Up](#Setting-up).

### Running tests

The project contains has style checking using [eslint][eslint] with a slightly modified [airbnb-config][airbnb-config].

```bash
# Run style checking for the frontend
cd client/
npm run lint

# Then run style checking for the backend
cd ../server/
npm run lint
```

Tests are run separately for frontend and backend. Both sets of tests can be automatically run with npm

```bash
# Run tests for frontend
cd client/
npm run test

# Then run tests for backend
cd ../server/
npm run test:api
```

The frontend test suite is done with [jest][jest] and [enzyme][enzyme]. The backend tests are currently only for the api-endpoints and are run with [mocha][mocha].

## Getting started

For further documentation see [docs/getting-started.md](docs/getting-started.md).

[node]: https://nodejs.org/en/
[golang]: https://golang.org/
[docker]: https://www.docker.com/
[docker-compose]: https://docs.docker.com/compose/
[eslint]: https://eslint.org/
[airbnb-config]: https://github.com/airbnb/javascript
[jest]: https://jestjs.io/
[enzyme]: https://github.com/airbnb/enzyme
[mocha]: https://mochajs.org/
