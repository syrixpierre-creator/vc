/**
 * LOCAL DEMO SERVER. In-memory data, fake Google sign-in page, serves ./web. Refuses to run in production.
 * Start:  node server/src/dev.ts   then open http://localhost:3000   (use Chrome or Firefox: cookies are Secure)
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, extname, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateKeyPairSync, sign, randomBytes } from "node:crypto";
import { createApp, type GoogleClient, type TokenResponse } from "./http/app.ts";
import { GoogleAuthError } from "./http/google-client.ts";
import { createSyncPorts } from "./sync/ports.ts";
import { runDueJobs, PeopleApiError, type PeopleApi } from "./sync/engine.ts";
import { MemoryStore } from "./store/memory.ts";
import type { Jwks } from "./auth/oauth.ts";

if (process.env["NODE_ENV"] === "production") { console.error("dev.ts must never run in production"); process.exit(1); }

const PORT = Number(process.env["PORT"] ?? 3000);
const APP = `http://localhost:${PORT}`;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", process.env["WEB_DIR"] ?? "web");
const CLIENT_ID = "dev-client";
const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwks: Jwks = { keys: [{ ...(publicKey.export({ format: "jwk" }) as Record<string, unknown>), kid: "dev" } as unknown as Jwks["keys"][number]] };
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
const codes = new Map<string, TokenResponse>();
const keyRing = { current: 1, keys: { 1: randomBytes(32).toString("hex") } };
const tokenOwner = new Map<string, string>(); // access token -> email (what the fake Google knows)
const revokedRefresh = new Set<string>();      // refresh tokens the "user" revoked in their Google account
const remote = new Map<string, { resourceName: string; name: string; phone?: string }[]>(); // the fake "Google Contacts" of each email
let remoteSeq = 0;

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
    const list = remote.get(email) ?? []; list.push({ resourceName, name: c.fullName, ...(c.phone ? { phone: c.phone } : {}) }); remote.set(email, list);
    return { resourceName, etag: `e${remoteSeq}` };
  },
  async updateContact(token, resourceName, _etag, c) {
    const email = tokenOwner.get(token);
    const row = email ? remote.get(email)?.find(x => x.resourceName === resourceName) : undefined;
    if (!row) throw new PeopleApiError("conflict", "404"); // removed on the Google side
    row.name = c.fullName; if (c.phone) row.phone = c.phone;
    return { etag: `e${++remoteSeq}` };
  },
};
const store = new MemoryStore();
const handler = createApp({
  store, google, keyRing,
  rules: { authCallback: { max: 1000, windowMs: 60_000 } },
  config: { appUrl: APP, sessionSecret: randomBytes(32).toString("hex"), adminEmail: process.env["ADMIN_EMAIL"] ?? "syrixcompany@gmail.com",
    google: { clientId: CLIENT_ID, redirectUri: `${APP}/api/auth/google/callback`, authEndpoint: `${APP}/dev/login` } },
});
// the same sync worker code as production, ticking fast so the demo feels live
const ports = createSyncPorts({ store, people, google, keyRing, now: Date.now });
let ticking = false;
setInterval(() => { if (ticking) return; ticking = true; runDueJobs(ports, 20).catch(() => undefined).finally(() => { ticking = false; }); }, 700);

const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png" };
const esc = (s: string) => s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", APP);
  const path = url.pathname;
  try {
    if (path === "/dev/login") { // stand-in for Google's consent page
      const q = url.searchParams;
      const wantsContacts = (q.get("scope") ?? "").includes("auth/contacts");
      const hidden = ["state", "nonce", "redirect_uri", "scope"].map(k => `<input type="hidden" name="${k}" value="${esc(q.get(k) ?? "")}">`).join("");
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(`<!doctype html><meta charset="utf-8"><title>Demo sign-in</title><body style="font:16px system-ui;max-width:420px;margin:12vh auto;padding:0 20px">
        <h1 style="font-size:20px">Demo sign-in (stand-in for Google)</h1><p style="color:#555">Local demo only. Nothing leaves your computer.</p>
        <form action="/dev/issue" method="get">${hidden}
        <p><label>Email<br><input name="email" value="you@example.com" style="width:100%;padding:10px"></label></p>
        <p><label>Name<br><input name="name" value="Demo User" style="width:100%;padding:10px"></label></p>
        ${wantsContacts ? `<p style="background:#f4f4f4;padding:12px;border-radius:8px"><label><input type="checkbox" name="allow_contacts" value="1" checked> Allow SYRIX VCF to <b>see, edit and create your Google contacts</b></label></p>` : ""}
        <button style="padding:10px 18px">Continue</button></form>`);
      return;
    }
    if (path === "/dev/seed") { // demo data for the signed-in demo user: a balance, XP and three challenges
      const email = (url.searchParams.get("email") ?? "").toLowerCase();
      const u = await store.findUserBySub(`dev-${email}`);
      if (!u) { res.statusCode = 404; res.end("sign in first"); return; }
      const now = Date.now(), DAY = 86_400_000;
      await store.addLedger({ id: "seed", userId: u.id, type: "earn", amountCents: 1700, idempotencyKey: `seed:${u.id}` });
      await store.addXp({ userId: u.id, amount: 250, reason: "seed", key: `seed-xp:${u.id}`, at: now });
      const mk = (slug: string, en: string, fr: string, difficulty: "advanced" | "expert" | "legendary", metric: "verified_operations" | "qualified_referrals" | "active_days", threshold: number) =>
        store.saveChallenge({ id: crypto.randomUUID(), slug, title: { en, fr }, description: { en: "Real, measurable work verified by the server.", fr: "Un travail réel et mesurable, vérifié par le serveur." },
          terms: "Progress is computed by the server from verified activity inside the challenge period.", published: true, difficulty, startsAt: now - DAY, endsAt: now + 20 * DAY, metric, threshold, rewardType: "xp", rewardXp: 200 });
      await mk("ops", "Contact Organizer", "Organisateur de contacts", "advanced", "verified_operations", 5);
      await mk("days", "Consistency Master", "Maître de la régularité", "expert", "active_days", 20);
      await mk("ref", "Growth Architect", "Architecte de croissance", "legendary", "qualified_referrals", 75);
      res.end("seeded");
      return;
    }
    if (path === "/dev/google-contacts") { // what is in the fake Google account (demo only)
      res.setHeader("content-type", "application/json"); res.end(JSON.stringify(remote.get((url.searchParams.get("email") ?? "").toLowerCase()) ?? [])); return;
    }
    if (path === "/dev/revoke") { // simulate the user removing SYRIX VCF in their Google account settings
      const em = (url.searchParams.get("email") ?? "").toLowerCase();
      revokedRefresh.add(`rt-${em}`);
      for (const [tok, owner] of [...tokenOwner]) if (owner === em) tokenOwner.delete(tok); // a revoked grant kills its access tokens too
      res.end("revoked"); return;
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
      const contactsOk = asked.includes("auth/contacts") && q.get("allow_contacts") === "1";
      if (asked.includes("auth/contacts")) {
        const at = `at-${randomBytes(6).toString("hex")}`;
        tokenOwner.set(at, email);
        revokedRefresh.delete(`rt-${email}`);
        codes.set(code, { idToken, accessToken: at, refreshToken: `rt-${email}`, expiresIn: 3600, scope: contactsOk ? asked : "openid email" });
      } else codes.set(code, { idToken });
      res.statusCode = 302;
      res.setHeader("location", `${q.get("redirect_uri")}?state=${encodeURIComponent(q.get("state") ?? "")}&code=${code}`);
      res.end();
      return;
    }
    if (path.startsWith("/api/") || path === "/healthz" || path === "/readyz") return void (await handler(req, res));
    if (path === "/register") { res.statusCode = 302; res.setHeader("location", `/api/auth/google/start?ref=${encodeURIComponent(url.searchParams.get("ref") ?? "")}`); res.end(); return; }
    if (path === "/app") { res.statusCode = 302; res.setHeader("location", "/app/"); res.end(); return; }

    let rel = normalize(decodeURIComponent(path)).replace(/^([/\\])+/, "");
    if (rel === "" || rel.endsWith(sep)) rel += "index.html";
    const file = join(ROOT, rel);
    if (!file.startsWith(ROOT + sep) && file !== ROOT) { res.statusCode = 403; res.end("forbidden"); return; }
    if (req.method !== "GET" && req.method !== "HEAD") { res.statusCode = 405; res.end(); return; }
    const st = await stat(file).catch(() => null);
    if (!st || !st.isFile()) { res.statusCode = 404; res.end("not found"); return; }
    res.setHeader("content-type", TYPES[extname(file)] ?? "application/octet-stream");
    res.setHeader("x-content-type-options", "nosniff");
    res.end(await readFile(file));
  } catch { res.statusCode = 500; res.end("error"); }
});
server.listen(PORT, () => console.log(`SYRIX VCF demo: ${APP}  (in-memory data, fake Google sign-in)`));
