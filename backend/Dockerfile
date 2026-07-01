FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p logs && chown -R node:node /usr/src/app

# Run container as a non-privileged user for enhanced security
USER node

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
