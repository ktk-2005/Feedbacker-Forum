# Feedbacker-Forum
[![Build Status](https://travis-ci.org/ktk-2005/Feedbacker-Forum.svg?branch=develop)](https://travis-ci.org/ktk-2005/Feedbacker-Forum)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

 // Motivation from product vision //

## Setting up

The project can be either run as manually setup parts for the database, frontend, backend, server and database, or run as contaners composed together with docker-compose.

## Prerequisites

The project is built using [Node.js][node], currently actively tested with version 10.13.
The project also requires [go][golang] for running the proxy.
Instances are run in containers with [docker][docker].

If the project is run with containers [docker-compose][docker-compose] is also required for orchestrating the containers.


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



## Getting started

For further documentation see [docs/getting-started.md](docs/getting-started.md).

[node]: https://nodejs.org/en/
[golang]: https://golang.org/
[docker]: https://www.docker.com/
[docker-compose]: https://docs.docker.com/compose/
