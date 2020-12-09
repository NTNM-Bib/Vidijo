FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN npm install git+https://github.com/NTNM-Bib/VidijoLib.git

EXPOSE 3000

CMD [ "npm", "run", "docker:dev:start" ]