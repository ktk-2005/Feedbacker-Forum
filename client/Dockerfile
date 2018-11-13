FROM node:10.13

WORKDIR /client

COPY package*.json /client/

RUN npm install

COPY . /client/

CMD ["npm", "run", "build:dev"]