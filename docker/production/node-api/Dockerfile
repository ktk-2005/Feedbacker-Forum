FROM node:10.13

WORKDIR /server

COPY .git/ /.git

COPY server/ /server

RUN /docker/production/node-api/docker-build.sh

CMD ["npm", "start"]