# Docker

Docker is used to run a portable development environment or a production environment. The point is that the host machine shouldn't need to have anything else than Docker installed to be able to run the software.

In the future, client applications should also be able to be deployed inside Docker.

The production configuration runs a separate nginx container that acts as a reverse proxy for the api. It passes api requests to the backend container and serves static files by itself.

## Usage

There are two different configurations set up with the Docker Compose tool to orchestrate multiple containers. Here's a summary of useful commands to know. The commands should be executed inside the folder in which the `docker-compose.yml` configuration file resides, ie. *docker/development/* or *docker/production/*.

* Rebuilding and starting the containers: `docker-compose up --build`
* Running in the background (daemon mode): `docker-compose up -d --build`
* Stopping containers in the background: `docker-compose down`

For more comands: `docker-compose help`
