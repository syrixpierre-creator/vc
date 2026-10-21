import { createServer } from "node:http";
import { loadConfig } from "./config/env.ts";
import { createPgDb } from "./store/db.ts";
import { PgStore } from "./store/pg.ts";
import { createApp } from "./http/app.ts";
import { createGoogleClient } from "./http/google-client.ts";

const cfg = loadConfig(); // fails fast, naming the bad variable but never its value
const db = await createPgDb(cfg.databaseUrl);
const store = new PgStore(db);
const handler = createApp({
  store,
  google: createGoogleClient({ clientId: cfg.google.clientId, clientSecret: cfg.google.clientSecret }),
  keyRing: { current: 1, keys: { 1: cfg.encryptionKey } },
  trustProxy: true, // only reachable through our Caddy proxy (see docker-compose.yml)
  ready: () => store.ping(),
  config: { appUrl: cfg.appUrl, sessionSecret: cfg.sessionSecret, adminEmail: cfg.adminEmail, google: { clientId: cfg.google.clientId, redirectUri: cfg.google.redirectUri }, ads: cfg.ads },
});
const server = createServer((req, res) => { void handler(req, res); });
server.headersTimeout = 15_000;
server.requestTimeout = 30_000;
server.listen(Number(process.env["PORT"] ?? 3000), "0.0.0.0", () => console.log(JSON.stringify({ level: "info", msg: "listening", port: process.env["PORT"] ?? 3000 })));

for (const sig of ["SIGTERM", "SIGINT"] as const) {
  process.on(sig, () => { server.close(() => { void db.close().then(() => process.exit(0)); }); setTimeout(() => process.exit(1), 10_000).unref(); });
}
