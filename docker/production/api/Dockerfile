FROM node:10.13-alpine

COPY .git/ /.git
COPY ./misc /misc
COPY server/ .
COPY docker/production/api/config.json .
RUN npm install
RUN mkdir -p build
RUN node ../misc/dump-version.js > ./build/version.json

###

FROM node:10.13-alpine

WORKDIR /app

COPY --from=0 /app /app

CMD npm start -- --config config.json
