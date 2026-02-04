FROM oven/bun:1 AS frontend-build
WORKDIR /app
COPY sprintplanner-web/package.json sprintplanner-web/bun.lock ./
RUN bun install --frozen-lockfile
COPY sprintplanner-web/ ./
RUN bun run build

FROM node:20-alpine AS backend-build
WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN npm install -g bun
COPY sprintplanner-api/package.json sprintplanner-api/bun.lock ./
RUN bun install --frozen-lockfile
COPY sprintplanner-api/ ./
RUN bun run build

FROM node:20-alpine AS backend
WORKDIR /app
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/package.json ./
COPY --from=backend-build /app/drizzle ./drizzle
COPY sprintplanner-api/drizzle.config.ts ./
ENV DATABASE_URL=/app/data/data.db
EXPOSE 3000 3001
CMD ["sh", "-c", "npx drizzle-kit migrate && node dist/src/main.js"]

FROM nginx:alpine AS nginx
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
