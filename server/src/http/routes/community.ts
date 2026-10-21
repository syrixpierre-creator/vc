import { randomUUID } from "node:crypto";
import type { AppCtx } from "../app.ts";
import type { TicketCategory } from "../../store/types.ts";
import { HttpError, pick, readJson, v, qInt, qEnum, qUuid } from "../kit.ts";
import { progressFor } from "../../domain/progress.ts";
import { notifyStaff } from "../../services/notify.ts";

const CATEGORIES: readonly TicketCategory[] = ["bug", "payment", "account", "partnership", "feature", "other"];
const xml = (s: string) => s.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[ch]!);

/** Brand mark used in generated cards (same geometry as web/assets/logo-mark.svg). */
const MARK = `<g transform="translate(64 64)"><circle cx="34" cy="34" r="30" fill="none" stroke="url(#gm)" stroke-width="5"/>
<path d="M60 6 41 31 32 36 10 62 27 38 36 30Z" fill="url(#gm)"/><g fill="#CFE0FF"><circle cx="19" cy="24" r="3.2"/><circle cx="26" cy="17" r="2.6"/><circle cx="46" cy="44" r="3.4"/><circle cx="53" cy="41" r="2.6"/></g></g>`;

export function shareCardSvg(o: { headline: string; sub: string; who: string; link?: string; accent: string }): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${xml(o.headline)}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse"><stop stop-color="#070B14"/><stop offset=".6" stop-color="#0C1630"/><stop offset="1" stop-color="#16123A"/></linearGradient>
<linearGradient id="gm" x1="0" y1="0" x2="68" y2="68" gradientUnits="userSpaceOnUse"><stop stop-color="#E8F0FF"/><stop offset=".55" stop-color="#7FA7FF"/><stop offset="1" stop-color="#A78BFA"/></linearGradient>
<radialGradient id="glow" cx="980" cy="120" r="520" gradientUnits="userSpaceOnUse"><stop stop-color="${o.accent}" stop-opacity=".35"/><stop offset="1" stop-color="${o.accent}" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#glow)"/>
<g stroke="#2A3B66" stroke-opacity=".5">${Array.from({ length: 9 }, (_, i) => `<line x1="${700 + i * 60}" y1="0" x2="${500 + i * 90}" y2="630"/>`).join("")}</g>
${MARK}<text x="152" y="96" fill="#E8EEF9" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="30" font-weight="700" letter-spacing="2">SYRIX VCF</text>
<text x="152" y="126" fill="#8C9BB8" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="15" letter-spacing="3">BY SYRIX VISION COMPANY</text>
<text x="64" y="330" fill="#FFFFFF" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="72" font-weight="800">${xml(o.headline)}</text>
<text x="64" y="392" fill="#A9B6D0" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="32">${xml(o.sub)}</text>
<rect x="64" y="450" width="${Math.min(900, 40 + o.who.length * 18)}" height="56" rx="28" fill="#FFFFFF" fill-opacity=".06" stroke="#FFFFFF" stroke-opacity=".12"/>
<text x="92" y="487" fill="#E8EEF9" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="24">${xml(o.who)}</text>
${o.link ? `<text x="64" y="574" fill="#7FA7FF" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="24">${xml(o.link)}</text>` : ""}
</svg>`;
}

export function registerCommunity(app: AppCtx) {
  const { router: r, store, config, now, send, sv } = app;
  const tr = (m: Record<string, string>, lang: string) => m[lang] ?? m["en"] ?? "";

  r.get("/api/public-config", { summary: "Public settings the website needs (no secrets)", tag: "system", access: "public" }, async c => {
    const a = config.ads;
    const intro = await store.getSetting("intro_first_visit_only");
    send(c, 200, { ads: a?.enabled && a.clientId ? { enabled: true, clientId: a.clientId } : { enabled: false }, introFirstVisitOnly: intro !== "false", supportEmail: config.supportEmail ?? config.adminEmail },
      { "Cache-Control": "public, max-age=60" });
  });
  r.get("/api/public/announcements", { summary: "Announcements published on the website", tag: "community", access: "public", query: "lang" }, async c => {
    const lang = c.url.searchParams.get("lang") ?? "en";
    const list = await store.listAnnouncements({ publishedOnly: true, siteOnly: true, limit: 3 });
    send(c, 200, { items: list.map(a => ({ id: a.id, kind: a.kind, title: tr(a.title, lang), body: tr(a.body, lang), publishedAt: a.publishedAt ?? a.createdAt })) }, { "Cache-Control": "public, max-age=60" });
  });

  /* ---------- notifications ---------- */
  r.get("/api/notifications", { summary: "Notification centre", tag: "community", access: "user", query: "unread=1, limit" }, async c => {
    const u = c.user!;
    const list = await store.listNotifications(u.id, qInt(c.url, "limit", 50, 1, 100), c.url.searchParams.get("unread") === "1");
    send(c, 200, { unread: await store.unreadCount(u.id), items: list.map(n => ({ id: n.id, kind: n.kind, payload: n.payload, essential: n.essential, read: !!n.readAt, createdAt: n.createdAt })) });
  });
  r.post("/api/notifications/read", { summary: "Mark notifications read", tag: "community", access: "write", allowWhenRestricted: true, body: "{ids: uuid[]} or {all: true}" }, async c => {
    const b = pick(await readJson(c.req), ["ids", "all"]);
    const n = b["all"] === true ? await store.markNotificationsRead(c.user!.id, "all") : await store.markNotificationsRead(c.user!.id, v.ids(b, "ids", 200));
    send(c, 200, { marked: n });
  });
  r.get("/api/announcements", { summary: "Community announcements", tag: "community", access: "user" }, async c => {
    const lang = c.user!.language;
    const list = await store.listAnnouncements({ publishedOnly: true, limit: 30 });
    send(c, 200, { items: list.map(a => ({ id: a.id, kind: a.kind, title: tr(a.title, lang), body: tr(a.body, lang), pinned: a.pinned, publishedAt: a.publishedAt ?? a.createdAt })) });
  });

  /* ---------- support ---------- */
  r.get("/api/support/tickets", { summary: "My support tickets", tag: "support", access: "user" }, async c => {
    send(c, 200, { items: (await store.listTicketsFor(c.user!.id)).map(t => ({ id: t.id, category: t.category, subject: t.subject, status: t.status, createdAt: t.createdAt, updatedAt: t.updatedAt })) });
  });
  r.post("/api/support/tickets", { summary: "Open a support ticket", tag: "support", access: "write", limit: "support", allowWhenRestricted: true, body: "{category, subject, body}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["category", "subject", "body"]);
    const category = v.oneOf(b, "category", CATEGORIES, true)!;
    const subject = v.str(b, "subject", { min: 3, max: 140, required: true })!;
    const body = v.str(b, "body", { min: 10, max: 5000, required: true, trim: false })!.trim();
    if ((await store.countOpenTicketsFor(u.id)) >= 10) throw new HttpError(409, "too_many_open_tickets");
    const id = randomUUID();
    await store.createTicket({ id, userId: u.id, category, subject, body, priority: category === "payment" ? "high" : "normal" });
    await notifyStaff(sv, "tickets.respond", { task: "ticket", ticketId: id, category });
    send(c, 201, { id });
  });
  r.get("/api/support/tickets/:id", { summary: "One ticket and its conversation (staff-only notes are never included)", tag: "support", access: "user" }, async c => {
    const t = await store.getTicket(c.params["id"]!);
    if (!t || t.userId !== c.user!.id) throw new HttpError(404, "not_found"); // users only ever see their own tickets
    const msgs = await store.ticketMessages(t.id, false);
    send(c, 200, { ...t, assignedTo: undefined, messages: msgs.map(m => ({ id: m.id, fromStaff: m.isStaff, body: m.body, createdAt: m.createdAt })) });
  });
  r.post("/api/support/tickets/:id/reply", { summary: "Reply to my ticket (reopens it)", tag: "support", access: "write", limit: "supportReply", allowWhenRestricted: true, body: "{body}" }, async c => {
    const t = await store.getTicket(c.params["id"]!);
    if (!t || t.userId !== c.user!.id) throw new HttpError(404, "not_found");
    const b = pick(await readJson(c.req), ["body"]);
    const body = v.str(b, "body", { min: 1, max: 5000, required: true })!;
    await store.addTicketMessage({ ticketId: t.id, authorId: c.user!.id, isStaff: false, internal: false, body });
    if (t.status !== "open") await store.updateTicket(t.id, { status: "open" });
    send(c, 200, { ok: true });
  });
  r.post("/api/support/tickets/:id/close", { summary: "Close my ticket", tag: "support", access: "write", allowWhenRestricted: true }, async c => {
    const t = await store.getTicket(c.params["id"]!);
    if (!t || t.userId !== c.user!.id) throw new HttpError(404, "not_found");
    await store.updateTicket(t.id, { status: "closed" });
    send(c, 200, { ok: true });
  });

  /* ---------- shareable achievement cards (no contacts, no e-mail, no money details) ---------- */
  r.get("/api/share/card.svg", { summary: "Achievement card as an image. Values come from your verified records; the referral link is included only with ref=1.", tag: "community", access: "user",
    query: "kind=level|referrals|challenge|vip|month, challenge=<id>, ref=1", produces: "image/svg+xml" }, async c => {
    const u = c.user!;
    const kind = qEnum(c.url, "kind", ["level", "referrals", "challenge", "vip", "month"] as const) ?? "level";
    const who = u.pseudonym ? `@${u.pseudonym}` : "A SYRIX VCF member";
    const prog = await progressFor(sv, u.id, now());
    let headline = "", sub = "", accent = "#4F7BFF";
    if (kind === "level") { headline = `Level ${prog.level} · ${prog.title}`; sub = `${prog.xp.toLocaleString("en-US")} XP earned with verified activity`; }
    if (kind === "vip") { headline = `VIP ${prog.vip}`; sub = `${prog.xp.toLocaleString("en-US")} XP · ${prog.longestStreak}-day best streak`; accent = "#A78BFA"; }
    if (kind === "referrals") {
      const n = (await store.referralCounts(u.id)).qualified;
      const reached = (await store.milestonesOf(u.id)).map(m => m.threshold).pop();
      headline = reached ? `${reached} referrals milestone` : `${n} qualified referrals`; sub = "Qualified after Google sign-in and anti-fraud checks"; accent = "#22C3A6";
    }
    if (kind === "challenge") {
      const id = qUuid(c.url, "challenge");
      const part = id ? await store.getParticipation(id, u.id) : null;
      const d = id ? await store.getChallenge(id) : null;
      if (!part?.completedAt || !d) throw new HttpError(404, "not_found"); // only challenges the server saw you complete
      headline = d.title[u.language] ?? d.title["en"] ?? "Challenge"; sub = `${d.difficulty[0]!.toUpperCase()}${d.difficulty.slice(1)} challenge completed`; accent = "#F5B544";
    }
    if (kind === "month") {
      const m = new Date(now()).toISOString().slice(0, 7);
      const ach = (await store.achievementsOf(u.id)).filter(a => new Date(a.at).toISOString().startsWith(m)).length;
      const done = (await store.participationsOf(u.id)).filter(p => p.completedAt && new Date(p.completedAt).toISOString().startsWith(m)).length;
      headline = `${new Date(now()).toLocaleString("en-US", { month: "long", timeZone: "UTC" })} recap`; sub = `${done} challenges · ${ach} achievements · ${prog.streakDays}-day streak`;
    }
    const link = c.url.searchParams.get("ref") === "1" ? `${config.appUrl.replace(/^https?:\/\//, "")}/register?ref=${(await store.getReferralCode(u.id)) ?? ""}` : undefined;
    send(c, 200, shareCardSvg({ headline, sub, who, accent, ...(link ? { link } : {}) }), { "Content-Type": "image/svg+xml; charset=utf-8", "Content-Disposition": `inline; filename="syrix-${kind}.svg"`,
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'" });
  });
}
