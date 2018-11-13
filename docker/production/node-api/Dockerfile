FROM node:10.13

COPY .git/ /.git
COPY server /server

WORKDIR /server

RUN npm install

CMD npm start
