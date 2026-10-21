FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
# dependencies first so rebuilds are fast. First build: run `npm install` once in server/ to create package-lock.json, then commit it.
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm install --omit=dev --no-audit --no-fund
COPY server ./server
COPY db ./db
COPY web ./web
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app
EXPOSE 3000
CMD ["node", "server/src/main.ts"]
