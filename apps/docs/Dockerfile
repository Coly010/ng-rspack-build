FROM --platform=linux/amd64 node:18-alpine

WORKDIR /app

COPY dist ./
COPY ecosystem.config.js ./

RUN npm install --global concurrently pm2@latest

EXPOSE 4000
CMD ["pm2-runtime", "node server/server.js"]
