FROM node:latest

WORKDIR /app

RUN npm i npm@latest -g

COPY package.json package-lock.json ./

RUN npm install

COPY . .
#
CMD ["node","service/auto/check_status.js"]