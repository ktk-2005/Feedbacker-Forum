FROM node:10.13-alpine

WORKDIR /app

COPY .git/ /.git
COPY ./misc /misc
COPY server/ .
COPY docker/production/api /prod
RUN sh /prod/docker-build.sh

###

FROM node:10.13-alpine

WORKDIR /app

COPY --from=0 /app /app

CMD npm start -- --config config.json
