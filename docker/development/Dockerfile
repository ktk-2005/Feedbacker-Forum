FROM node:10.13

COPY . /app/

WORKDIR /app/server

RUN /app/docker/development/docker-build.sh

CMD npm start
