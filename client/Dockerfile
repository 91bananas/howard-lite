# Frontend image. Build context is the repo ROOT (like howard's client/Dockerfile):
#   docker build -f client/Dockerfile .
FROM node:24-bookworm-slim AS build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --no-audit --no-fund

COPY client/ ./
RUN npx vite build

FROM nginx:1.27-alpine AS runtime

# PORT: the platform injects it (Railway does). BACKEND_URL: where /v1 is proxied.
# NGINX_ENTRYPOINT_LOCAL_RESOLVERS makes the image export NGINX_LOCAL_RESOLVERS
# from /etc/resolv.conf so nginx can look up private hostnames at request time.
ENV PORT=80 \
	BACKEND_URL=http://backend:4000 \
	NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1

COPY client/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/client/dist/ /usr/share/nginx/html/

EXPOSE 80
