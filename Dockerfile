# Backend image (built from the repo root, like howard's root Dockerfile).
FROM node:24-bookworm-slim

ENV NODE_ENV=production \
	PORT=4000
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src

USER node
EXPOSE 4000
CMD ["node", "src/main.js"]
