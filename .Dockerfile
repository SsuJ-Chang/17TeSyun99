FROM node:18-alpine

WORKDIR /17TeSyun99

COPY package.json package.json
RUN npm install

COPY . .

EXPOSE 80

CMD node app.js