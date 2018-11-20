FROM node:10.13-alpine

COPY . /app/

WORKDIR /app/server

RUN /app/docker/development/docker-build.sh

CMD npm start
