# syntax=docker/dockerfile:1
# SYRIX VCF — one image for the web app and the background worker.
# Node 22 runs the TypeScript sources directly (type stripping): no build step, what you read is what runs.
FROM node:22-alpine AS deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
# Behind a TLS-inspecting proxy, pass its CA: docker build --secret id=extra_ca,src=/path/ca.crt (optional)
RUN --mount=type=secret,id=extra_ca,required=false \
    if [ -f /run/secrets/extra_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca; fi; \
    npm ci --omit=dev --no-audit --no-fund

FROM node:22-alpine
ENV NODE_ENV=production NODE_OPTIONS=--disable-warning=ExperimentalWarning
WORKDIR /app
RUN addgroup -S app && adduser -S -G app app
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY server/package.json ./server/
COPY server/src ./server/src
COPY db ./db
COPY web ./web
USER app
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/src/main.ts"]
