# Build stage
FROM node:12 AS build

WORKDIR /usr/src/app

# Development version: 8.3.23
RUN npm install -g @angular/cli@9

COPY package*.json ./
RUN npm install

EXPOSE 4200
# Expose port for webpack
EXPOSE 49153

# --poll 1000 is needed on Windows to check for changes every 10ms
CMD ng serve --host 0.0.0.0 --poll 10 --disableHostCheck=true
