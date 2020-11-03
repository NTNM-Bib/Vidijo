# Build stage
FROM node:12 AS build

WORKDIR /usr/src/app

RUN npm install -g @angular/cli@10

COPY package*.json ./
RUN npm install

COPY . .

# Personal configuration
RUN npm install -g png-to-ico
RUN npm install -g ngx-pwa-icons

WORKDIR /usr/src/app/config
RUN png-to-ico icon.png > favicon.ico

WORKDIR /usr/src/app
RUN ngx-pwa-icons -i config/icon.png

WORKDIR /usr/src/app/config
RUN cp environment.prod.ts /usr/src/app/src/environments/environment.prod.ts
RUN cp favicon.ico /usr/src/app/src/favicon.ico

WORKDIR /usr/src/app

# Build
RUN ng build --prod


# NGINX
FROM nginx

COPY --from=build /usr/src/app/dist/visoa-app /usr/share/nginx/html
COPY --from=build /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]