FROM node:18-alpine

WORKDIR /17TeSyun99

COPY package*.json ./
RUN npm install
RUN npm install express@4
RUN npm install socket.io

COPY . .

EXPOSE 3099

CMD [ "node", "app.js" ]