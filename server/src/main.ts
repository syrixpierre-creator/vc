import { createServer } from "node:http";
import { Redis } from "ioredis";
import { loadConfig } from "./config/env.ts";
import { createPgDb } from "./store/db.ts";
import { PgStore } from "./store/pg.ts";
import { createApp } from "./http/app.ts";
import { createGoogleClient } from "./http/google-client.ts";
import { redisLimiter, RULES } from "./security/ratelimit.ts";
import { bullDispatcher, redisConnection } from "./services/queue.ts";
import { diskUsage } from "./services/jobs.ts";

const cfg = loadConfig(); // fails fast, naming the bad variable but never its value
const log = (level: string, msg: string, extra: object = {}) => { if (level !== "debug" || cfg.logLevel === "debug") console.log(JSON.stringify({ t: new Date().toISOString(), level, msg, ...extra })); };
const db = createPgDb(cfg.databaseUrl, { max: 20 });
const store = new PgStore(db);
const redis = new Redis(cfg.redisUrl, { maxRetriesPerRequest: 2, enableOfflineQueue: false, lazyConnect: false });
redis.on("error", e => log("error", "redis error", { error: e.message }));
const dispatch = bullDispatcher(redisConnection(cfg.redisUrl), e => log("error", "queue error", { error: (e as Error).message }));
const timed = async (f: () => Promise<unknown>) => { const t = Date.now(); try { await f(); return { ok: true, latencyMs: Date.now() - t }; } catch (e) { return { ok: false, error: (e as Error).message.slice(0, 120) }; } };

const handler = createApp({
  store, dispatch,
  google: createGoogleClient({ clientId: cfg.google.clientId, clientSecret: cfg.google.clientSecret }),
  keyRing: { current: cfg.encryptionKeyVersion, keys: cfg.encryptionKeys },
  limiter: redisLimiter(redis, RULES, e => log("warn", "rate limiter unavailable, allowing request", { error: (e as Error).message })),
  trustProxy: cfg.trustProxy, log,
  ready: async () => (await store.ping()) && (await redis.ping()) === "PONG",
  health: async () => ({ postgres: await timed(() => store.ping()), redis: await timed(() => redis.ping()), disk: await diskUsage("/"), version: cfg.version, uptimeSeconds: Math.round(process.uptime()) }),
  config: { appUrl: cfg.appUrl, sessionSecret: cfg.sessionSecret, adminEmail: cfg.adminEmail, supportEmail: cfg.supportEmail, version: cfg.version, webRoot: cfg.webRoot,
    google: { clientId: cfg.google.clientId, redirectUri: cfg.google.redirectUri }, ads: cfg.ads },
});
const server = createServer((req, res) => { void handler(req, res); });
server.headersTimeout = 15_000;
server.requestTimeout = 60_000;
server.keepAliveTimeout = 5_000;
server.listen(cfg.port, "0.0.0.0", () => log("info", "listening", { port: cfg.port, version: cfg.version }));

for (const sig of ["SIGTERM", "SIGINT"] as const) {
  process.on(sig, () => {
    log("info", "shutting down", { sig });
    server.close(() => { void Promise.allSettled([db.close(), dispatch.close(), redis.quit()]).then(() => process.exit(0)); });
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
