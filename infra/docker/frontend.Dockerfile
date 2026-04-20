FROM node:22-alpine AS build

WORKDIR /workspace/frontend

COPY frontend/package.json ./
COPY frontend/package-lock.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build

FROM nginx:1.27-alpine

COPY infra/docker/nginx.frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
