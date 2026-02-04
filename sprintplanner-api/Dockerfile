FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY dist/ ./dist/
COPY public/ ./public/
COPY drizzle/ ./drizzle/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
