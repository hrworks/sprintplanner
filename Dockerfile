FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY sprintplanner-web/package*.json ./
RUN npm ci
COPY sprintplanner-web/ ./
RUN npm run build

FROM node:20-alpine AS backend-build
WORKDIR /app
COPY sprintplanner-api/package*.json ./
RUN npm ci
COPY sprintplanner-api/ ./
RUN npm run build

FROM node:20-alpine AS backend
WORKDIR /app
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/package.json ./
COPY --from=backend-build /app/drizzle ./drizzle
EXPOSE 3000 3001
CMD ["node", "dist/src/main.js"]

FROM nginx:alpine AS nginx
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
