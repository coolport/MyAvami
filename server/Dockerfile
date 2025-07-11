FROM node:20-alpine

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm ci

COPY ./server ./server

WORKDIR /app/server

EXPOSE 5555

CMD ["node", "server.js"]