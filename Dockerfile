FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      ffmpeg git ca-certificates python3 make g++ fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "manager.js"]
