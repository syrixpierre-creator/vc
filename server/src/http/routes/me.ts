import type { AppCtx } from "../app.ts";
import type { UserSettings } from "../../store/types.ts";
import { HttpError, pick, readJson, v, LANGS, type Ctx } from "../kit.ts";
import { hashSessionId } from "../../auth/session.ts";
import { csrfToken } from "../../security/csrf.ts";
import { permissionsFor } from "../../auth/rbac.ts";
import { normalizeE164, maskPhone, isCountryCode, dialCodeFor, COUNTRIES } from "../../domain/phone.ts";
import { decrypt } from "../../security/crypto.ts";
import { refreshContext } from "../../sync/ports.ts";
import { computeBalances } from "../../domain/ledger.ts";
import { recordEvent } from "../../domain/progress.ts";
import { notify } from "../../services/notify.ts";
import { generateVcf } from "../../domain/vcf.ts";
import { toVcf } from "./contacts.ts";

const TIME_ZONES = new Set(["UTC", ...Intl.supportedValuesOf("timeZone")]); // the list omits "UTC", which browsers report
export const DELETION_GRACE_MS = 14 * 86_400_000;
const month = (t: number) => new Date(t).toISOString().slice(0, 7);

export function registerMe(app: AppCtx) {
  const { router: r, store, config, now, send, sv } = app;

  async function mePayload(c: Ctx) {
    const u = c.user!;
    const [settings, restrictions, unread, ref] = await Promise.all([store.getSettings(u.id), store.activeRestrictions(u.id), store.unreadCount(u.id), store.getReferralCode(u.id)]);
    return {
      id: u.id, email: u.email, name: u.name, avatarUrl: u.avatarUrl ?? null, language: u.language, dialCode: u.dialCode, countryCode: u.countryCode ?? null, timeZone: u.timeZone ?? null,
      phoneMasked: u.phone ? maskPhone(u.phone) : null, pseudonym: u.pseudonym ?? null, leaderboardOptIn: !!u.leaderboardOptIn, onboarded: !!u.onboardedAt, status: u.status,
      deletionRequestedAt: u.deletionRequestedAt ?? null, deletionAt: u.deletionRequestedAt ? u.deletionRequestedAt + DELETION_GRACE_MS : null, premiumUntil: u.premiumUntil ?? null,
      roles: u.roles, permissions: permissionsFor(u.roles), restrictions: [...restrictions], unreadNotifications: unread, referralCode: ref, settings,
      createdAt: u.createdAt, supportEmail: config.supportEmail ?? config.adminEmail, csrfToken: csrfToken(c.sid!, config.sessionSecret),
    };
  }

  r.get("/api/me", { summary: "Signed-in user, settings, permissions and CSRF token", tag: "account", access: "user" }, async c => send(c, 200, await mePayload(c)));

  r.patch("/api/me", { summary: "Update profile", tag: "account", access: "write", body: "{name?, language?, countryCode?, dialCode?, timeZone?, pseudonym?, leaderboardOptIn?}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["name", "language", "dialCode", "countryCode", "timeZone", "pseudonym", "leaderboardOptIn"]);
    const next = { ...u };
    const name = v.str(b, "name", { min: 1, max: 80 }); if (name !== undefined) next.name = name;
    const lang = v.oneOf(b, "language", LANGS); if (lang) next.language = lang;
    if ("countryCode" in b) {
      if (!isCountryCode(b["countryCode"])) throw new HttpError(400, "invalid_countryCode");
      next.countryCode = b["countryCode"];
      if (!("dialCode" in b)) next.dialCode = dialCodeFor(next.countryCode) ?? next.dialCode;
    }
    const dial = v.str(b, "dialCode", { max: 5, pattern: /^\+?[1-9]\d{0,3}$/ }); if (dial !== undefined) next.dialCode = dial.startsWith("+") ? dial : `+${dial}`;
    if ("timeZone" in b) { if (typeof b["timeZone"] !== "string" || !TIME_ZONES.has(b["timeZone"])) throw new HttpError(400, "invalid_timeZone"); next.timeZone = b["timeZone"]; }
    if ("pseudonym" in b) {
      if (b["pseudonym"] === null || b["pseudonym"] === "") { delete next.pseudonym; next.leaderboardOptIn = false; }
      else {
        const ps = v.str(b, "pseudonym", { max: 24, pattern: /^[A-Za-z0-9_-]{3,24}$/ })!; // no spaces, no @: cannot be an e-mail or a full real name by accident
        const owner = await store.findUserByPseudonym(ps);
        if (owner && owner.id !== u.id) throw new HttpError(409, "pseudonym_taken");
        next.pseudonym = ps;
      }
    }
    const opt = v.bool(b, "leaderboardOptIn");
    if (opt !== undefined) { if (opt && !next.pseudonym) throw new HttpError(400, "pseudonym_required"); next.leaderboardOptIn = opt; }
    await store.saveUser(next);
    c.user = (await store.getUser(u.id))!;
    send(c, 200, await mePayload(c));
  });

  r.get("/api/countries", { summary: "Countries with their international dialing code", tag: "account", access: "public" }, async c => send(c, 200, { items: COUNTRIES }, { "Cache-Control": "public, max-age=86400" }));

  r.post("/api/me/onboarding", { summary: "Finish onboarding (country, language, sync preference, privacy acknowledgement)", tag: "account", access: "write",
    body: "{countryCode, language, timeZone?, autoSync?, privacyAcknowledged: true}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["countryCode", "language", "timeZone", "autoSync", "privacyAcknowledged"]);
    if (b["privacyAcknowledged"] !== true) throw new HttpError(400, "privacy_acknowledgement_required");
    if (!isCountryCode(b["countryCode"])) throw new HttpError(400, "invalid_countryCode");
    const lang = v.oneOf(b, "language", LANGS, true)!;
    const tz = typeof b["timeZone"] === "string" && TIME_ZONES.has(b["timeZone"]) ? b["timeZone"] : u.timeZone;
    await store.saveUser({ ...u, countryCode: b["countryCode"], dialCode: dialCodeFor(b["countryCode"]) ?? u.dialCode, language: lang, ...(tz ? { timeZone: tz } : {}), onboardedAt: u.onboardedAt ?? now() });
    const auto = v.bool(b, "autoSync");
    if (auto !== undefined) await store.saveSettings(u.id, { autoSync: auto });
    c.user = (await store.getUser(u.id))!;
    send(c, 200, await mePayload(c));
  });

  r.get("/api/me/settings", { summary: "Notification, privacy and display settings", tag: "account", access: "user" }, async c => send(c, 200, await store.getSettings(c.user!.id)));
  r.patch("/api/me/settings", { summary: "Change notification, privacy and display settings", tag: "account", access: "write",
    body: "{notifyEmailMarketing?, notifyReminders?, notifyInappProgress?, notifyEmailRewards?, profilePublic?, theme?}" }, async c => {
    const u = c.user!;
    const keys = ["notifyEmailMarketing", "notifyReminders", "notifyInappProgress", "notifyEmailRewards", "profilePublic"] as const;
    const b = pick(await readJson(c.req), [...keys, "theme"]);
    const patch: Partial<UserSettings> = {};
    for (const k of keys) { const x = v.bool(b, k); if (x !== undefined) patch[k] = x; }
    const theme = v.oneOf(b, "theme", ["dark", "light", "system"] as const); if (theme) patch.theme = theme;
    await store.saveSettings(u.id, patch);
    if (keys.some(k => k in b)) await recordEvent(sv, u.id, "security_tasks", now(), `sec:privacy:${month(now())}`); // reviewing privacy options is one Security Champion task
    send(c, 200, await store.getSettings(u.id));
  });

  /* --- the account's single phone number (unique across accounts) --- */
  r.put("/api/me/phone", { summary: "Set the account's phone number (unique across accounts, always masked)", tag: "account", access: "write", body: "{phone}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["phone"]);
    const e = typeof b["phone"] === "string" ? normalizeE164(b["phone"], u.dialCode, u.countryCode) : null;
    if (!e) throw new HttpError(400, "invalid_phone");
    const owner = await store.findUserByPhone(e);
    if (owner && owner.id !== u.id) throw new HttpError(409, "phone_already_used");
    await store.saveUser({ ...u, phone: e });
    send(c, 200, { phoneMasked: maskPhone(e) });
  });

  /* --- sessions and security --- */
  r.get("/api/me/sessions", { summary: "Active sessions (device, approximate network, last activity)", tag: "security", access: "user" }, async c => {
    const mine = hashSessionId(c.sid!).toString("hex");
    const list = await store.listSessions(c.user!.id);
    send(c, 200, { items: list.map(s => ({ id: s.idHash.slice(0, 16), current: s.idHash === mine, userAgent: s.userAgent ?? null, network: s.ipPrefix ?? null, createdAt: s.createdAt, lastSeenAt: s.lastSeenAt })) });
  });
  r.delete("/api/me/sessions/:key", { summary: "Sign out one session", tag: "security", access: "write", allowWhenRestricted: true }, async c => {
    if (!/^[0-9a-f]{16}$/.test(c.params["key"]!)) throw new HttpError(404, "not_found");
    if (hashSessionId(c.sid!).toString("hex").startsWith(c.params["key"]!)) throw new HttpError(409, "use_logout_for_current_session");
    if (!(await store.revokeSessionByPrefix(c.user!.id, c.params["key"]!))) throw new HttpError(404, "not_found");
    await store.addSecurityEvent({ userId: c.user!.id, kind: "session_revoked", detail: { by: "user" }, at: now() });
    send(c, 200, { ok: true });
  });
  r.post("/api/me/sessions/revoke-others", { summary: "Sign out every other session", tag: "security", access: "write", allowWhenRestricted: true }, async c => {
    const n = await store.revokeSessions(c.user!.id, hashSessionId(c.sid!).toString("hex"));
    await store.addSecurityEvent({ userId: c.user!.id, kind: "sessions_revoked", detail: { count: n, by: "user" }, at: now() });
    await recordEvent(sv, c.user!.id, "security_tasks", now(), `sec:sessions:${month(now())}`);
    send(c, 200, { revoked: n });
  });
  r.post("/api/me/security-checkup", { summary: "Confirm a security check-up step (sessions or connected access reviewed)", tag: "security", access: "write", body: "{task: sessions|connected_access}" }, async c => {
    const b = pick(await readJson(c.req), ["task"]);
    const task = v.oneOf(b, "task", ["sessions", "connected_access"] as const, true)!;
    await recordEvent(sv, c.user!.id, "security_tasks", now(), `sec:${task}:${month(now())}`);
    send(c, 200, { ok: true });
  });
  r.get("/api/me/security-events", { summary: "Recent security events on this account", tag: "security", access: "user" }, async c => {
    const list = await store.listSecurityEvents({ userId: c.user!.id, limit: 50 });
    send(c, 200, { items: list.map(e => ({ kind: e.kind, network: e.ipPrefix ?? null, at: e.at })) });
  });

  /* --- data export and account deletion --- */
  r.get("/api/me/export", { summary: "Download all personal data (JSON; contacts also as vCard text)", tag: "account", access: "user", limit: "export", produces: "application/json" }, async c => {
    const u = c.user!;
    const [contacts, labels, refs, ledger, payouts, methods, claims, xp, ach, parts, tickets, settings, sessions, events] = await Promise.all([
      store.allContacts(u.id), store.listLabels(u.id), store.listReferralsByReferrer(u.id), store.ledgerFor(u.id), store.listPayoutsFor(u.id), store.listPayoutMethods(u.id),
      store.listRewardClaimsFor(u.id), store.xpRows(u.id), store.achievementsOf(u.id), store.participationsOf(u.id), store.listTicketsFor(u.id), store.getSettings(u.id),
      store.listSessions(u.id), store.listSecurityEvents({ userId: u.id, limit: 500 })]);
    const ticketsFull = await Promise.all(tickets.map(async t => ({ ...t, messages: (await store.ticketMessages(t.id, false)).map(m => ({ fromStaff: m.isStaff, body: m.body, at: m.createdAt })) })));
    const out = {
      exportedAt: new Date(now()).toISOString(), product: "SYRIX VCF — BY SYRIX VISION COMPANY",
      profile: { id: u.id, name: u.name, email: u.email, language: u.language, countryCode: u.countryCode ?? null, timeZone: u.timeZone ?? null, phone: u.phone ?? null, pseudonym: u.pseudonym ?? null, createdAt: u.createdAt },
      settings, labels: labels.map(l => ({ id: l.id, name: l.name, color: l.color })),
      contacts: contacts.map(x => ({ id: x.id, fullName: x.fullName, phones: x.phones, emails: x.emails, organization: x.organization ?? null, title: x.title ?? null, notes: x.notes ?? null, labelIds: x.labelIds, syncState: x.syncState, createdAt: x.createdAt, updatedAt: x.updatedAt })),
      contactsVcf: generateVcf(contacts.map(toVcf), "4.0"),
      referrals: refs.map(x => ({ status: x.status, createdAt: x.createdAt, qualifiedAt: x.qualifiedAt ?? null })),
      wallet: { balances: computeBalances(ledger), ledger: ledger.map(l => ({ type: l.type, amountCents: l.amountCents, reason: l.reason ?? null, at: l.createdAt })),
        payoutMethods: methods.map(m => ({ kind: m.kind, maskedHint: m.maskedHint, recipientName: m.recipientName ?? null })),
        payouts: payouts.map(p => ({ id: p.id, amountCents: p.amountCents, status: p.status, method: p.methodKind, maskedHint: p.maskedHint, txReference: p.txReference ?? null, createdAt: p.createdAt })) },
      rewardClaims: claims.map(x => ({ source: x.source, kind: x.kind, status: x.status, amountCents: x.amountCents ?? null, createdAt: x.createdAt })),
      progression: { xp: xp.map(x => ({ amount: x.amount, reason: x.reason, at: x.at })), achievements: ach, challenges: parts },
      support: ticketsFull, sessions: sessions.map(s => ({ userAgent: s.userAgent, network: s.ipPrefix, lastSeenAt: s.lastSeenAt })), securityEvents: events.map(e => ({ kind: e.kind, at: e.at })),
    };
    await store.addSecurityEvent({ userId: u.id, kind: "data_exported", detail: {}, at: now() });
    send(c, 200, JSON.stringify(out, null, 2), { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="syrix-vcf-export-${new Date(now()).toISOString().slice(0, 10)}.json"` });
  });

  r.post("/api/me/delete", { summary: `Request account deletion (${DELETION_GRACE_MS / 86_400_000}-day grace period, then personal data is erased)`, tag: "account", access: "write", limit: "account",
    body: "{confirm: \"DELETE\"}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["confirm"]);
    if (b["confirm"] !== "DELETE") throw new HttpError(400, "confirmation_required");
    if (u.status === "pending_deletion") throw new HttpError(409, "already_requested");
    const conn = await store.getConnection(u.id);
    if (conn.refreshTokenEnc) { try { await app.deps.google.revokeToken(decrypt(conn.refreshTokenEnc, app.deps.keyRing, refreshContext(u.id))); } catch { /* local action never depends on Google */ } }
    await store.saveConnection(u.id, { status: "not_connected" });
    await store.setDeletionRequested(u.id, now());
    await store.revokeSessions(u.id, hashSessionId(c.sid!).toString("hex"));
    await store.addSecurityEvent({ userId: u.id, kind: "deletion_requested", detail: {}, at: now() });
    await notify(sv, u.id, "account_deletion", { status: "scheduled", at: now() + DELETION_GRACE_MS });
    send(c, 200, { status: "pending_deletion", deletionAt: now() + DELETION_GRACE_MS });
  });
  r.post("/api/me/delete/cancel", { summary: "Cancel a pending account deletion", tag: "account", access: "write", allowWhenRestricted: true }, async c => {
    const u = c.user!;
    if (u.status !== "pending_deletion") throw new HttpError(409, "not_pending_deletion");
    await store.setDeletionRequested(u.id, null);
    await store.addSecurityEvent({ userId: u.id, kind: "deletion_cancelled", detail: {}, at: now() });
    send(c, 200, { status: "active" });
  });
}
