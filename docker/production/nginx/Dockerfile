FROM node:10.13

WORKDIR /app
COPY client/ .

RUN npm install
RUN npm run build

###

FROM nginx:alpine

COPY --from=0 /app /app
COPY docker/production/nginx/nginx.conf /etc/nginx/nginx.conf
