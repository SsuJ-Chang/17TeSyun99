FROM node:18-alpine

WORKDIR /17TeSyun99

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3099

CMD [ "node", "app.js" ]