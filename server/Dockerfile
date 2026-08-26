FROM node:20-alpine

WORKDIR /app

COPY ./package.json ./package-lock.json ./tsconfig.json ./
RUN npm ci

COPY ./server ./server

RUN npm run build

EXPOSE 5555

CMD ["node", "dist/server.js"]
