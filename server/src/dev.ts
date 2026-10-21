/**
 * LOCAL DEMO SERVER. Real PostgreSQL (migrations applied at start), fake Google sign-in and fake Google Contacts.
 * Refuses to run in production. Redis is optional here: without it, queued work runs in this process.
 *
 *   DATABASE_URL=postgres://postgres@127.0.0.1:5432/syrix_dev node src/dev.ts     then open http://localhost:3000
 *   (docker compose -f docker-compose.dev.yml up -d   starts a local PostgreSQL + Redis)
 */
import { createServer } from "node:http";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateKeyPairSync, sign, randomBytes, randomUUID } from "node:crypto";
import { createApp, type GoogleClient, type TokenResponse } from "./http/app.ts";
import { GoogleAuthError } from "./http/google-client.ts";
import { createSyncPorts } from "./sync/ports.ts";
import { PeopleApiError, type PeopleApi } from "./sync/engine.ts";
import { createPgDb } from "./store/db.ts";
import { PgStore } from "./store/pg.ts";
import { runMigrations, readMigrations } from "./migrate.ts";
import { runSyncJob, sweepSync, maintenance, referralsTick, sendEmail } from "./services/jobs.ts";
import { memoryMailer } from "./services/mailer.ts";
import type { Dispatcher, EmailJob } from "./services/queue.ts";
import { notify, type Services } from "./services/notify.ts";
import { recordEvent, checkAchievements } from "./domain/progress.ts";
import { creditQualified } from "./domain/rewards.ts";
import { TEMPLATES, DEFAULT_TERMS } from "./domain/challenge-templates.ts";
import type { Jwks } from "./auth/oauth.ts";

if (process.env["NODE_ENV"] === "production") { console.error("dev.ts must never run in production"); process.exit(1); }

const PORT = Number(process.env["PORT"] ?? 3000);
const APP = `http://localhost:${PORT}`;
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", process.env["WEB_DIR"] ?? "web");
const DB_URL = process.env["DATABASE_URL"] ?? "postgres://postgres@127.0.0.1:5432/syrix_dev";
const CLIENT_ID = "dev-client";
const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwks: Jwks = { keys: [{ ...(publicKey.export({ format: "jwk" }) as Record<string, unknown>), kid: "dev" } as unknown as Jwks["keys"][number]] };
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
const codes = new Map<string, TokenResponse>();
const keyRing = { current: 1, keys: { 1: process.env["DEV_ENCRYPTION_KEY"] ?? "de".repeat(32) } }; // fixed so data stays readable across restarts (demo only)
const tokenOwner = new Map<string, string>(); // access token -> email (what the fake Google knows)
const revokedRefresh = new Set<string>();      // refresh tokens the "user" revoked in their Google account
const remote = new Map<string, { resourceName: string; name: string; phones: string[] }[]>(); // the fake "Google Contacts" of each e-mail
let remoteSeq = 0;
const log = (level: string, msg: string, extra: object = {}) => { if (level !== "debug") console.log(`[${level}] ${msg}`, Object.keys(extra).length ? JSON.stringify(extra) : ""); };

const google: GoogleClient = {
  async exchangeCode(code) { const t = codes.get(code); codes.delete(code); if (!t) throw new Error("bad code"); return t; },
  async getJwks() { return jwks; },
  async refreshAccessToken(rt) {
    if (revokedRefresh.has(rt)) throw new GoogleAuthError("invalid_grant");
    const at = `at-${randomBytes(6).toString("hex")}`;
    tokenOwner.set(at, rt.replace(/^rt-/, ""));
    return { accessToken: at, expiresIn: 3600 };
  },
  async revokeToken(t) { revokedRefresh.add(t); },
};
const people: PeopleApi = {
  async createContact(token, c) {
    const email = tokenOwner.get(token);
    if (!email) throw new PeopleApiError("auth_revoked", "401");
    const resourceName = `people/c${++remoteSeq}`;
    const list = remote.get(email) ?? []; list.push({ resourceName, name: c.fullName, phones: c.phones }); remote.set(email, list);
    return { resourceName, etag: `e${remoteSeq}` };
  },
  async updateContact(token, resourceName, _etag, c) {
    const email = tokenOwner.get(token);
    const row = email ? remote.get(email)?.find(x => x.resourceName === resourceName) : undefined;
    if (!row) throw new PeopleApiError("conflict", "404"); // removed on the Google side
    row.name = c.fullName; row.phones = c.phones;
    return { etag: `e${++remoteSeq}` };
  },
};

const db = createPgDb(DB_URL, { max: 10 });
const done = await runMigrations(db, readMigrations(join(HERE, "..", "..", "db", "migrations")), m => log("info", m));
if (done.length) log("info", "migrations applied", { done });
const store = new PgStore(db);
const outbox: EmailJob[] = [];
const mailer = memoryMailer();
let sv: Services;
// in-process queue: same job functions as the BullMQ worker, without Redis
const dispatch: Dispatcher = {
  async syncJob(id, _attempt, delayMs = 0) { setTimeout(() => void runSyncJob(sv, ports, id).then(r => { if (r.retryInMs !== undefined) void dispatch.syncJob(id, 0, Math.min(r.retryInMs, 60_000)); }).catch(e => log("error", "sync", { error: (e as Error).message })), Math.max(300, delayMs)); },
  async email(j) { outbox.push(j); await sendEmail(sv, mailer, j, { appUrl: APP, supportEmail: "syrixcompany@gmail.com" }).catch(() => undefined); },
  async close() { /* nothing */ },
};
sv = { store, dispatch, now: Date.now, keyRing, log };
const ports = createSyncPorts({ store, people, google, keyRing, now: Date.now,
  async onSynced(userId, contactId, version) { if (await recordEvent(sv, userId, "sync_successes", Date.now(), `sync:${contactId}:${version}`)) await checkAchievements(sv, userId); },
  async onRevoked(userId) { await notify(sv, userId, "sync_revoked", {}); } });
setInterval(() => void sweepSync(sv).catch(() => undefined), 5000);
setInterval(() => void referralsTick(sv).catch(e => log("error", "referrals", { error: (e as Error).message })), 60_000);
setInterval(() => void maintenance(sv).catch(() => undefined), 3600_000);
await store.heartbeat("worker", { mode: "dev in-process" });
setInterval(() => void store.heartbeat("worker", { mode: "dev in-process" }), 30_000);

const handler = createApp({
  store, google, keyRing, dispatch, log,
  rules: { authCallback: { max: 1000, windowMs: 60_000 }, write: { max: 5000, windowMs: 60_000 }, contactCreate: { max: 2000, windowMs: 60_000 }, vcfImport: { max: 100, windowMs: 60_000 } },
  ready: () => store.ping(),
  health: async () => ({ postgres: { ok: await store.ping() }, redis: { ok: false, note: "not used by the local demo" }, mode: "local demo" }),
  config: { appUrl: APP, sessionSecret: process.env["DEV_SESSION_SECRET"] ?? "local-demo-session-secret-not-for-production", adminEmail: process.env["ADMIN_EMAIL"] ?? "syrixcompany@gmail.com",
    supportEmail: "syrixcompany@gmail.com", webRoot: ROOT, version: "dev",
    google: { clientId: CLIENT_ID, redirectUri: `${APP}/api/auth/google/callback`, authEndpoint: `${APP}/dev/login` } },
});

const esc = (s: string) => s.replace(/[&<>"']/g, ch => `&#${ch.charCodeAt(0)};`);
const page = (title: string, body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#070B14;color:#E8EEF9;font:15px/1.5 system-ui,sans-serif}main{width:min(420px,92vw);background:#0E1526;border:1px solid #1E2A44;border-radius:16px;padding:28px}
h1{font-size:19px;margin:0 0 6px}p{color:#8C9BB8;margin:0 0 18px}label{display:block;font-size:13px;color:#A9B6D0;margin:0 0 12px}input[type=text],input[type=email]{width:100%;box-sizing:border-box;margin-top:6px;padding:11px 12px;border-radius:10px;border:1px solid #2A3756;background:#0A1120;color:#fff;font:inherit}
.c{display:flex;gap:10px;align-items:flex-start;background:#0A1120;border:1px solid #2A3756;border-radius:10px;padding:12px;margin:6px 0 16px}button{width:100%;padding:12px;border:0;border-radius:10px;background:#3D6BFF;color:#fff;font:600 15px system-ui;cursor:pointer}
.tag{display:inline-block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#F5B544;border:1px solid #6b5422;border-radius:99px;padding:2px 8px;margin-bottom:12px}</style></head><body><main>${body}</main></body></html>`;

async function seed(email: string) {
  const u = await store.findUserBySub(`dev-${email}`);
  if (!u) return "sign in first";
  const now = Date.now(), DAY = 86_400_000;
  const names = ["Amina Moreau", "Lucas Ferreira", "Sofia Martínez", "Youssef Benali", "Chloé Dubois", "Mateus Lima", "Valentina Rossi", "Omar Haddad", "Inès Laurent", "Diego Alvarez", "Fatima Zahra", "Hugo Bernard"];
  let n = 0;
  for (const [i, name] of names.entries()) {
    try { await store.createContact(u.id, { fullName: name, phones: [`+3361234${String(5600 + i).padStart(4, "0")}`], emails: [`${name.split(" ")[0]!.toLowerCase()}@example.com`], ...(i % 3 === 0 ? { organization: "Syrix Partners" } : {}) }); n++; } catch { /* already seeded */ }
  }
  const labels = await store.listLabels(u.id);
  if (!labels.length) { await store.createLabel(u.id, "Family", "rose"); await store.createLabel(u.id, "Work", "blue"); await store.createLabel(u.id, "Clients", "teal"); }
  const month = new Date(now).toISOString().slice(0, 7);
  const start = Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), 1), end = Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth() + 1, 1);
  const slugs = new Set((await store.listChallenges(false)).map(c => c.slug));
  for (const t of TEMPLATES) {
    const slug = `${t.slug}-${month}`;
    if (slugs.has(slug)) continue;
    await store.saveChallenge({ id: randomUUID(), slug, title: t.title, description: t.description, terms: DEFAULT_TERMS, difficulty: t.difficulty, metric: t.metric, threshold: t.threshold,
      startsAt: Math.min(start, now - DAY), endsAt: Math.max(end, now + 7 * DAY), rewardType: t.rewardType, ...(t.rewardXp ? { rewardXp: t.rewardXp } : {}), reviewRequired: !!t.reviewRequired, published: true });
  }
  if (!(await store.listAnnouncements({ publishedOnly: true, limit: 1 })).length) {
    await store.saveAnnouncement({ id: randomUUID(), kind: "challenge", title: { en: "This month's challenges are live", fr: "Les défis du mois sont en ligne" },
      body: { en: "Ten new challenges across four difficulty tiers. Progress is verified by the server.", fr: "Dix nouveaux défis sur quatre niveaux de difficulté. La progression est vérifiée par le serveur." },
      status: "published", pinned: true, showOnSite: true, publishedAt: now, createdAt: now });
  }
  return `seeded ${n} contacts, labels, ${TEMPLATES.length} challenges and an announcement`;
}

/** Demo only: creates `n` referred demo accounts and qualifies them now (to show milestones and the $10 reward flow). */
async function fakeReferrals(email: string, count: number) {
  const u = await store.findUserBySub(`dev-${email}`);
  if (!u) return "sign in first";
  let code = await store.getReferralCode(u.id);
  if (!code) { code = randomBytes(5).toString("hex").toUpperCase(); await store.setReferralCode(u.id, code); }
  for (let i = 0; i < count; i++) {
    const tag = randomBytes(5).toString("hex");
    const friend = await store.createUser({ googleSub: `dev-ref-${tag}`, email: `friend-${tag}@example.com`, name: `Friend ${tag.slice(0, 4)}`, language: "en", dialCode: "", status: "active", roles: [] });
    const r = { id: randomUUID(), referrerId: u.id, referredId: friend.id, status: "pending" as const, networkHash: randomBytes(32).toString("hex"), createdAt: Date.now() - 2 * 86_400_000 };
    await store.createReferral(r);
    await creditQualified(sv, r, Date.now());
  }
  return `${count} qualified referrals added`;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", APP);
  const path = url.pathname;
  try {
    if (path === "/dev/login") { // stand-in for Google's consent page
      const q = url.searchParams;
      const wantsContacts = (q.get("scope") ?? "").includes("auth/contacts");
      const hidden = ["state", "nonce", "redirect_uri", "scope"].map(k => `<input type="hidden" name="${k}" value="${esc(q.get(k) ?? "")}">`).join("");
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(page("Demo sign-in", `<span class="tag">Local demo</span><h1>Sign in (stand-in for Google)</h1><p>Nothing leaves your computer. In production this step is Google's own page.</p>
        <form action="/dev/issue" method="get">${hidden}<label>E-mail<input type="email" name="email" value="${esc(q.get("login_hint") ?? "you@example.com")}"></label><label>Name<input type="text" name="name" value="Demo User"></label>
        ${wantsContacts ? `<div class="c"><input type="checkbox" id="ac" name="allow_contacts" value="1" checked><label for="ac" style="margin:0">Allow SYRIX VCF to <b>see, edit and create your Google contacts</b></label></div>` : ""}
        <button>Continue</button></form>`));
      return;
    }
    if (path === "/dev/issue") {
      const q = url.searchParams;
      const email = (q.get("email") ?? "").toLowerCase();
      const sec = Math.floor(Date.now() / 1000);
      const h = b64({ alg: "RS256", kid: "dev" });
      const p = b64({ iss: "https://accounts.google.com", aud: CLIENT_ID, sub: `dev-${email}`, email, email_verified: true, nonce: q.get("nonce"), iat: sec, exp: sec + 600, name: q.get("name") ?? email });
      const code = randomBytes(12).toString("hex");
      const idToken = `${h}.${p}.${sign("RSA-SHA256", Buffer.from(`${h}.${p}`), privateKey).toString("base64url")}`;
      const asked = q.get("scope") ?? "";
      if (asked.includes("auth/contacts")) {
        const at = `at-${randomBytes(6).toString("hex")}`;
        tokenOwner.set(at, email);
        revokedRefresh.delete(`rt-${email}`);
        codes.set(code, { idToken, accessToken: at, refreshToken: `rt-${email}`, expiresIn: 3600, scope: q.get("allow_contacts") === "1" ? asked : "openid email" });
      } else codes.set(code, { idToken });
      res.statusCode = 302;
      res.setHeader("location", `${q.get("redirect_uri")}?state=${encodeURIComponent(q.get("state") ?? "")}&code=${code}`);
      res.end();
      return;
    }
    if (path === "/dev/seed") { res.end(await seed((url.searchParams.get("email") ?? "").toLowerCase())); return; }
    if (path === "/dev/referrals") { res.end(await fakeReferrals((url.searchParams.get("email") ?? "").toLowerCase(), Math.min(600, Number(url.searchParams.get("n") ?? 10)))); return; }
    if (path === "/dev/google-contacts") { res.setHeader("content-type", "application/json"); res.end(JSON.stringify(remote.get((url.searchParams.get("email") ?? "").toLowerCase()) ?? [])); return; }
    if (path === "/dev/outbox") { res.setHeader("content-type", "application/json"); res.end(JSON.stringify({ queued: outbox.slice(-50), rendered: mailer.sent.slice(-20).map(m => ({ to: m.to, subject: m.subject })) })); return; }
    if (path === "/dev/revoke") { // simulate the user removing SYRIX VCF in their Google account settings
      const em = (url.searchParams.get("email") ?? "").toLowerCase();
      revokedRefresh.add(`rt-${em}`);
      for (const [tok, owner] of [...tokenOwner]) if (owner === em) tokenOwner.delete(tok); // a revoked grant kills its access tokens too
      res.end("revoked"); return;
    }
    await handler(req, res);
  } catch (e) { log("error", "dev server", { error: (e as Error).message }); if (!res.headersSent) { res.statusCode = 500; res.end("error"); } }
});
server.listen(PORT, () => log("info", `SYRIX VCF local demo: ${APP}  (PostgreSQL: ${DB_URL.replace(/\/\/[^@]*@/, "//***@")}, fake Google sign-in)`));
