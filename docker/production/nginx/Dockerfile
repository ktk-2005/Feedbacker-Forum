FROM node:10.13-alpine

WORKDIR /app

COPY client/ .
COPY misc/ /misc

RUN apk add --no-cache git
RUN npm install
RUN npm run build

###

FROM nginx:alpine

COPY --from=0 /app /app
COPY docker/production/nginx/nginx.conf /etc/nginx/nginx.conf
