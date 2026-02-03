FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY public/ ./public/
COPY drizzle/ ./drizzle/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
