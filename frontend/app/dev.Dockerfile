# Build stage
FROM node:12 AS build

WORKDIR /usr/src/app

RUN npm install -g @angular/cli@10

COPY package*.json ./
RUN npm install

EXPOSE 4200
# Expose port for webpack
EXPOSE 49153

# --poll is needed on Windows to check for changes in a given interval
CMD ng serve --host 0.0.0.0 --poll 10 --disableHostCheck=true
