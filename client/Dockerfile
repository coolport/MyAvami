FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Lockfile is not committed to this repo, so npm ci cannot be used here.
RUN npm install --no-audit --no-fund

COPY . .

# Vite bakes API URLs into the bundle at build time.
ARG VITE_API_URL=http://localhost:5555
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
