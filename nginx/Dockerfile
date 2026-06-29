FROM node:20-alpine AS frontend

# Variáveis Vite injetadas em build time via docker-compose args
ARG VITE_42_CLIENT_ID
ARG VITE_42_REDIRECT_URI
ARG VITE_DEV_MODE=false
ARG VITE_API_URL=""
ENV VITE_42_CLIENT_ID=$VITE_42_CLIENT_ID
ENV VITE_42_REDIRECT_URI=$VITE_42_REDIRECT_URI
ENV VITE_DEV_MODE=$VITE_DEV_MODE
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=frontend /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
