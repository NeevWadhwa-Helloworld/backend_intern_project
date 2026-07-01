FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Multi-stage build for a clean, minimal runtime environment
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

# Copy built server assets
COPY --from=builder /usr/src/app /usr/src/app

# Run container as a non-privileged user for enhanced security
USER node

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
