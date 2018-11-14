FROM node:10.13

WORKDIR /app

COPY .git/ /.git
COPY server/ .

RUN npm install

CMD npm start
