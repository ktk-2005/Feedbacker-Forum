FROM node:10.13

WORKDIR /app

COPY .git/ /.git
COPY server/ .
COPY docker/production/api/config.json .

RUN npm install

CMD npm start -- --config config.json
