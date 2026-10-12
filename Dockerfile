# syntax=docker/dockerfile:1

# Image du back-office web Interveo : export statique Next.js servi par nginx.
# Node 24 comme la CI (.github/workflows/ci.yml).

# ---- build ------------------------------------------------------------------
FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Adresse de l'API : INTEGREE au code a la compilation (export statique), pas
# lue au demarrage. Pour la changer, il faut reconstruire l'image :
#   docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:3300 .
# Elle doit etre joignable depuis le navigateur du visiteur, pas depuis le
# conteneur.
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- runtime ----------------------------------------------------------------
FROM nginx:stable-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
