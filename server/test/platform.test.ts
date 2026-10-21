import { test, after } from "node:test";
import assert from "node:assert/strict";
import { startHarness, type Session } from "./harness.ts";

const h = await startHarness();
after(() => h.close());
let seq = 30_000_000;
const ph = () => `+336${String(seq++).padStart(8, "0")}`;
type C = { id: string; fullName: string; phones: string[]; emails: string[]; labelIds: string[]; syncState: string; notes: string | null; organization: string | null };
const create = async (s: Session, body: Record<string, unknown>) => { const r = await h.send(s, "/api/contacts", body); assert.equal(r.status, 201, await r.clone().text()); return (await r.json()) as C; };
const list = (s: Session, q = "") => h.json<{ total: number; items: C[] }>(h.get(s, `/api/contacts${q}`));

/* ---------- contacts ---------- */
test("contacts: several numbers per contact, national numbers use the user's country, duplicates are refused across all numbers", async () => {
  const s = await h.login("ct1", "ct1@x.com");
  assert.equal((await h.send(s, "/api/me/onboarding", { countryCode: "FR", language: "fr", privacyAcknowledged: true })).status, 200);
  const c = await create(s, { fullName: "Amina Moreau", phones: ["06 12 34 56 78", "+33 1 98 76 54 32"], emails: ["Amina@Example.com"] });
  assert.deepEqual(c.phones, ["+33612345678", "+33198765432"], "normalised to E.164, primary first");
  assert.deepEqual(c.emails, ["amina@example.com"]);
  assert.equal((await h.send(s, "/api/contacts", { fullName: "Twin", phones: ["+33198765432"] })).status, 409, "the second number is taken too");
  const bad = await h.send(s, "/api/contacts", { fullName: "Bad", phones: ["+33612000000", "12"] });
  assert.equal(bad.status, 400);
  assert.equal(((await bad.json()) as { value: string }).value, "12", "tells which number is wrong");
  assert.equal((await h.send(s, `/api/contacts/${c.id}`, { phones: ["+33612345678"] }, "PATCH")).status, 200, "removing a number");
  assert.equal((await h.send(s, "/api/contacts", { fullName: "Now free", phones: ["+33198765432"] })).status, 201, "the removed number is free again");
});

test("contacts: search by name, organisation, e-mail and digits; filters; sort; pagination", async () => {
  const s = await h.login("ct2", "ct2@x.com");
  await create(s, { fullName: "Zoé Alpha", phones: [ph()], organization: "Syrix Partners" });
  await create(s, { fullName: "Bruno Beta", phones: ["+33644455566"], emails: ["bruno@corp.example"] });
  await create(s, { fullName: "Carla Gamma" });
  assert.equal((await list(s, "?q=partners")).total, 1, "organisation");
  assert.equal((await list(s, "?q=corp.example")).total, 1, "e-mail");
  assert.equal((await list(s, "?q=444555")).total, 1, "digits");
  assert.equal((await list(s, "?q=%25")).total, 0, "LIKE wildcards are escaped");
  assert.equal((await list(s, "?q=' OR 1=1 --")).total, 0, "no SQL injection through search");
  assert.deepEqual((await list(s, "?sort=-name")).items.map(x => x.fullName), ["Zoé Alpha", "Carla Gamma", "Bruno Beta"]);
  assert.equal((await list(s, "?sync=local_only")).total, 3);
  const p1 = await list(s, "?limit=2&offset=0"), p2 = await list(s, "?limit=2&offset=2");
  assert.equal(p1.items.length + p2.items.length, 3);
  assert.equal((await h.get(s, "/api/contacts?sort=evil")).status, 400);
  assert.equal((await h.get(s, "/api/contacts?label=not-a-uuid")).status, 400);
});

test("labels: create, assign, filter, bulk label/unlabel on selection or filter, history records field names only", async () => {
  const s = await h.login("ct3", "ct3@x.com");
  const a = await create(s, { fullName: "Lab A", phones: [ph()], notes: "secret note" });
  const b = await create(s, { fullName: "Lab B", phones: [ph()] });
  await create(s, { fullName: "Other" });
  const work = await h.json<{ id: string }>(h.send(s, "/api/labels", { name: "Work", color: "teal" }));
  assert.equal((await h.send(s, "/api/labels", { name: "Work" })).status, 409, "unique per user");
  assert.equal((await h.send(s, "/api/labels", { name: "X", color: "neon" })).status, 400);
  assert.equal((await h.send(s, `/api/contacts/${a.id}/labels`, { labelIds: [work.id] }, "PUT")).status, 200);
  assert.equal((await list(s, `?label=${work.id}`)).total, 1);
  const bulk = await h.json<{ affected: number }>(h.send(s, "/api/contacts/bulk", { action: "label", labelId: work.id, filter: { q: "Lab" } }));
  assert.equal(bulk.affected, 1, "only B was new");
  assert.equal((await list(s, `?label=${work.id}`)).total, 2);
  const labels = await h.json<{ items: { id: string; count: number }[] }>(h.get(s, "/api/labels"));
  assert.equal(labels.items.find(l => l.id === work.id)!.count, 2);
  await h.send(s, "/api/contacts/bulk", { action: "unlabel", labelId: work.id, ids: [b.id] });
  assert.equal((await list(s, `?label=${work.id}`)).total, 1);
  await h.send(s, `/api/contacts/${a.id}`, { notes: "changed secret" }, "PATCH");
  const hist = await h.json<{ items: { action: string; fields: string[] }[] }>(h.get(s, `/api/contacts/${a.id}/history`));
  assert.deepEqual(hist.items.map(x => x.action), ["updated", "labeled", "created"]);
  assert.deepEqual(hist.items[0]!.fields, ["notes"]);
  assert.ok(!JSON.stringify(hist).includes("secret"), "values never stored in history");
  const other = await h.login("ct3b", "ct3b@x.com");
  assert.equal((await h.send(other, `/api/contacts/${a.id}/labels`, { labelIds: [] }, "PUT")).status, 404, "not someone else's contact");
  assert.equal((await h.send(other, "/api/contacts/bulk", { action: "label", labelId: work.id, ids: [a.id] })).status, 200);
  assert.equal((await list(s, `?label=${work.id}`)).total, 1, "another user's label/ids change nothing");
});

test("bulk delete needs confirmation and only touches the user's own contacts", async () => {
  const s = await h.login("ct4", "ct4@x.com");
  const t = await h.login("ct4b", "ct4b@x.com");
  const mine = await create(s, { fullName: "Mine", phones: [ph()] });
  const theirs = await create(t, { fullName: "Theirs", phones: [ph()] });
  assert.equal((await h.send(s, "/api/contacts/bulk", { action: "delete", ids: [mine.id, theirs.id] })).status, 400, "confirmation required");
  const prev = await h.json<{ count: number }>(h.send(s, "/api/contacts/bulk", { action: "delete", ids: [mine.id], preview: true }));
  assert.equal(prev.count, 1);
  const r = await h.json<{ affected: number }>(h.send(s, "/api/contacts/bulk", { action: "delete", ids: [mine.id, theirs.id], confirm: true }));
  assert.equal(r.affected, 1);
  assert.equal((await list(t)).total, 1, "the other user's contact is untouched");
});

test("duplicates: suggestions by shared e-mail or name; merge keeps every number and e-mail; dismiss hides a group", async () => {
  const s = await h.login("ct5", "ct5@x.com");
  const a = await create(s, { fullName: "Amina Moreau", phones: [ph()], emails: ["amina@x.org"], organization: "Syrix" });
  const b = await create(s, { fullName: "Moreau, Amina", phones: [ph()], notes: "met in Lyon" });
  const c = await create(s, { fullName: "Bruno", emails: ["amina@x.org"] });
  const d1 = await create(s, { fullName: "Twin Name" });
  const d2 = await create(s, { fullName: "twin name" });
  let dups = await h.json<{ items: { key: string; reasons: string[]; contacts: { id: string }[] }[] }>(h.get(s, "/api/contacts/duplicates"));
  const g = dups.items.find(x => x.contacts.some(y => y.id === a.id))!;
  assert.deepEqual(g.contacts.map(x => x.id).sort(), [a.id, b.id, c.id].sort());
  assert.ok(g.reasons.includes("same_email") && g.reasons.includes("same_name"));
  const merged = await h.json<C>(h.send(s, "/api/contacts/merge", { primaryId: a.id, otherIds: [b.id, c.id] }));
  assert.equal(merged.phones.length, 2);
  assert.equal(merged.organization, "Syrix");
  assert.equal(merged.notes, "met in Lyon");
  assert.equal((await h.get(s, `/api/contacts/${b.id}`)).status, 404, "merged contacts are removed");
  dups = await h.json(h.get(s, "/api/contacts/duplicates"));
  const twin = dups.items.find(x => x.contacts.some(y => y.id === d1.id))!;
  assert.ok(twin.contacts.some(y => y.id === d2.id));
  assert.equal((await h.send(s, "/api/contacts/duplicates/dismiss", { key: twin.key })).status, 200);
  dups = await h.json(h.get(s, "/api/contacts/duplicates"));
  assert.equal(dups.items.length, 0);
  const other = await h.login("ct5b", "ct5b@x.com");
  assert.equal((await h.send(other, "/api/contacts/merge", { primaryId: d1.id, otherIds: [d2.id] })).status, 404, "cannot merge someone else's contacts");
});

test("VCF import strategies: skip keeps existing contacts as they are, merge adds new numbers and e-mails without overwriting", async () => {
  const s = await h.login("ct6", "ct6@x.com");
  const existing = await create(s, { fullName: "Keep My Name", phones: ["+33655500011"] });
  const vcf = "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Different Name\r\nTEL:+33655500011\r\nTEL:+33655500012\r\nEMAIL:new@x.com\r\nORG:NewOrg\r\nEND:VCARD\r\n" +
    "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Fresh\r\nTEL:+33655500013\r\nEND:VCARD\r\n" +
    "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Fresh Twin In File\r\nTEL:+33655500013\r\nEMAIL:twin@x.com\r\nEND:VCARD\r\n";
  const prev = await h.json<{ toImport: number; duplicatesExisting: number; duplicatesInFile: number; sample: unknown[] }>(h.send(s, "/api/contacts/import?mode=preview&strategy=merge", vcf));
  assert.deepEqual([prev.toImport, prev.duplicatesExisting, prev.duplicatesInFile], [1, 1, 1]);
  const skip = await h.json<{ imported: number; merged: number }>(h.send(s, "/api/contacts/import?mode=commit&strategy=skip", vcf));
  assert.deepEqual([skip.imported, skip.merged], [1, 0]);
  assert.deepEqual((await h.json<C>(h.get(s, `/api/contacts/${existing.id}`))).phones, ["+33655500011"], "skip: untouched");
  const fresh = (await list(s, "?q=Fresh")).items[0]!;
  assert.deepEqual(fresh.emails, ["twin@x.com"], "the in-file twin was folded into the first card");
  const merge = await h.json<{ imported: number; merged: number }>(h.send(s, "/api/contacts/import?mode=commit&strategy=merge", vcf));
  assert.deepEqual([merge.imported, merge.merged], [0, 1], "Fresh already holds everything the file has: only the existing contact changes");
  const after = await h.json<C>(h.get(s, `/api/contacts/${existing.id}`));
  assert.equal(after.fullName, "Keep My Name", "never overwritten");
  assert.deepEqual(after.phones, ["+33655500011", "+33655500012"]);
  assert.deepEqual(after.emails, ["new@x.com"]);
  assert.equal(after.organization, "NewOrg", "empty field filled");
  assert.equal((await h.send(s, "/api/contacts/import?mode=commit&strategy=overwrite", vcf)).status, 400);
});

test("VCF export: all, selected ids, or the current filter; other users' ids are ignored", async () => {
  const s = await h.login("ct7", "ct7@x.com");
  const t = await h.login("ct7b", "ct7b@x.com");
  const a = await create(s, { fullName: "Export A", phones: [ph()] });
  await create(s, { fullName: "Export B", phones: [ph()], organization: "Acme" });
  const foreign = await create(t, { fullName: "Foreign", phones: [ph()] });
  const all = await (await h.get(s, "/api/contacts/export?version=4.0")).text();
  assert.equal(all.match(/BEGIN:VCARD/g)!.length, 2);
  const sel = await (await h.get(s, `/api/contacts/export?ids=${a.id},${foreign.id}`)).text();
  assert.ok(sel.includes("Export A") && !sel.includes("Foreign") && !sel.includes("Export B"));
  const filt = await (await h.get(s, "/api/contacts/export?q=acme")).text();
  assert.ok(filt.includes("Export B") && !filt.includes("Export A"));
  assert.equal((await h.get(s, "/api/contacts/export?version=5.0")).status, 400);
});

/* ---------- backups ---------- */
test("backups: encrypted at rest, downloadable, restore re-creates only what is missing (never overwrites or deletes), owner only", async () => {
  const s = await h.login("bk1", "bk1@x.com");
  const a = await create(s, { fullName: "Backup Alice", phones: ["+33677700001"] });
  const b = await create(s, { fullName: "Backup Bob", phones: ["+33677700002"] });
  const made = await h.json<{ id: string; contactCount: number }>(h.send(s, "/api/backups", { label: "Before cleanup" }));
  assert.equal(made.contactCount, 2);
  const raw = await h.sql("SELECT payload_enc FROM contact_backups WHERE id = $1", [made.id]);
  assert.ok(String(raw[0]!["payload_enc"]).startsWith("v1:") && !String(raw[0]!["payload_enc"]).includes("Alice"), "encrypted");
  const dl = await h.get(s, `/api/backups/${made.id}/download`);
  assert.match(dl.headers.get("content-type")!, /vcard/);
  assert.ok((await dl.text()).includes("Backup Alice"));
  // the user deletes one contact and edits the other
  await h.send(s, `/api/contacts/${b.id}?confirm=true`, {}, "DELETE");
  await h.send(s, `/api/contacts/${a.id}`, { fullName: "Alice Renamed" }, "PATCH");
  const prev = await h.json<{ toRestore: number; alreadyPresent: number }>(h.get(s, `/api/backups/${made.id}/preview`));
  assert.deepEqual([prev.toRestore, prev.alreadyPresent], [1, 1]);
  assert.equal((await h.send(s, `/api/backups/${made.id}/restore`, {})).status, 400, "confirmation required");
  const res = await h.json<{ restored: number; safetyBackupId: string }>(h.send(s, `/api/backups/${made.id}/restore`, { confirm: true }));
  assert.equal(res.restored, 1);
  assert.ok(res.safetyBackupId, "a safety backup is taken before restoring");
  const names = (await list(s)).items.map(x => x.fullName).sort();
  assert.deepEqual(names, ["Alice Renamed", "Backup Bob"], "the edit is kept, the deleted one is back");
  const other = await h.login("bk2", "bk2@x.com");
  for (const p of [`/api/backups/${made.id}/download`, `/api/backups/${made.id}/preview`]) assert.equal((await h.get(other, p)).status, 404, p);
  assert.equal((await h.send(other, `/api/backups/${made.id}/restore`, { confirm: true })).status, 404);
  assert.equal((await h.send(s, `/api/backups/${made.id}`, {}, "DELETE")).status, 400, "delete needs confirmation");
  assert.equal((await h.send(s, `/api/backups/${made.id}?confirm=true`, {}, "DELETE")).status, 200);
  assert.equal((await h.json<{ items: unknown[] }>(h.get(s, "/api/backups"))).items.length, 1, "the safety backup remains");
});

/* ---------- onboarding, settings, sessions ---------- */
test("onboarding: a new account lands on the wizard; country sets the dialing code; privacy acknowledgement required", async () => {
  const start = await fetch(`${h.base}/api/auth/google/start?next=/app/`, { redirect: "manual" });
  const loc = new URL(start.headers.get("location")!);
  const state = loc.searchParams.get("state")!;
  h.codes.set("ob-code", { idToken: h.idToken(loc.searchParams.get("nonce")!, "ob1", "ob1@x.com") });
  const cb = await fetch(`${h.base}/api/auth/google/callback?state=${state}&code=ob-code`, { redirect: "manual", headers: { cookie: `__Host-oauth=${state}` } });
  assert.equal(cb.headers.get("location"), "/app/#/onboarding");
  const s = await h.login("ob1", "ob1@x.com");
  assert.equal((await h.send(s, "/api/me/onboarding", { countryCode: "BR", language: "pt" })).status, 400);
  assert.equal((await h.send(s, "/api/me/onboarding", { countryCode: "XX", language: "pt", privacyAcknowledged: true })).status, 400);
  const me = await h.json<{ onboarded: boolean; dialCode: string; countryCode: string; language: string; settings: { autoSync: boolean } }>(
    h.send(s, "/api/me/onboarding", { countryCode: "BR", language: "pt", timeZone: "America/Sao_Paulo", autoSync: false, privacyAcknowledged: true }));
  assert.deepEqual([me.onboarded, me.dialCode, me.countryCode, me.language, me.settings.autoSync], [true, "+55", "BR", "pt", false]);
  const again = await h.login("ob1", "ob1@x.com", undefined, { next: "/app/" });
  void again;
});

test("settings and privacy: notification preferences, theme, invalid values refused", async () => {
  const s = await h.login("st1", "st1@x.com");
  const r = await h.json<{ notifyInappProgress: boolean; theme: string }>(h.send(s, "/api/me/settings", { notifyInappProgress: false, theme: "light" }, "PATCH"));
  assert.deepEqual([r.notifyInappProgress, r.theme], [false, "light"]);
  assert.equal((await h.send(s, "/api/me/settings", { theme: "neon" }, "PATCH")).status, 400);
  assert.equal((await h.send(s, "/api/me/settings", { autoSync: true }, "PATCH")).status, 400, "sync settings live in their own endpoint");
  assert.equal((await h.send(s, "/api/me", { timeZone: "Mars/Olympus" }, "PATCH")).status, 400);
  assert.equal((await h.send(s, "/api/me", { timeZone: "Africa/Casablanca", name: "Sami" }, "PATCH")).status, 200);
});

test("sessions: list devices, sign out others, cannot revoke the current one through the list", async () => {
  const s1 = await h.login("ss1", "ss1@x.com");
  const s2 = await h.login("ss1", "ss1@x.com");
  const sessions = await h.json<{ items: { id: string; current: boolean }[] }>(h.get(s1, "/api/me/sessions"));
  assert.equal(sessions.items.length, 2);
  const cur = sessions.items.find(x => x.current)!;
  assert.equal((await h.send(s1, `/api/me/sessions/${cur.id}`, {}, "DELETE")).status, 409);
  assert.equal((await h.json<{ revoked: number }>(h.send(s1, "/api/me/sessions/revoke-others", {}))).revoked, 1);
  assert.equal((await h.get(s2, "/api/me")).status, 401, "the other device is signed out");
  assert.equal((await h.get(s1, "/api/me")).status, 200);
  const ev = await h.json<{ items: { kind: string }[] }>(h.get(s1, "/api/me/security-events"));
  assert.ok(ev.items.some(e => e.kind === "sessions_revoked") && ev.items.some(e => e.kind === "login"));
});

/* ---------- account export and deletion ---------- */
test("account export contains the user's own data only, as a download", async () => {
  const s = await h.login("ex1", "ex1@x.com");
  await create(s, { fullName: "Exported Person", phones: [ph()] });
  const r = await h.get(s, "/api/me/export");
  assert.match(r.headers.get("content-disposition")!, /attachment; filename="syrix-vcf-export-/);
  const data = await r.json() as { profile: { email: string }; contacts: { fullName: string }[]; contactsVcf: string };
  assert.equal(data.profile.email, "ex1@x.com");
  assert.equal(data.contacts[0]!.fullName, "Exported Person");
  assert.ok(data.contactsVcf.includes("BEGIN:VCARD"));
});

test("account deletion: confirmation, grace period, read-only meanwhile, cancel, then erasure keeps no personal data", async () => {
  const s = await h.login("del1", "del1@x.com");
  await h.connectContacts(s, { sub: "del1", email: "del1@x.com", refreshToken: "rt-del" });
  await create(s, { fullName: "To Be Erased", phones: [ph()] });
  assert.equal((await h.send(s, "/api/me/delete", {})).status, 400);
  const r = await h.json<{ status: string; deletionAt: number }>(h.send(s, "/api/me/delete", { confirm: "DELETE" }));
  assert.equal(r.status, "pending_deletion");
  assert.ok(h.fake.revoked.includes("rt-del"), "Google access revoked at once");
  assert.equal((await h.send(s, "/api/contacts", { fullName: "x" })).status, 403, "no new data while deletion is pending");
  assert.equal((await h.send(s, "/api/me/delete/cancel", {})).status, 200);
  assert.equal((await h.send(s, "/api/contacts", { fullName: "Back" })).status, 201);
  await h.send(s, "/api/me/delete", { confirm: "DELETE" });
  const { deletionsTick } = await import("../src/services/jobs.ts");
  assert.equal((await deletionsTick(h.sv)).done, 0, "not before the grace period");
  h.advance(15 * 86_400_000);
  assert.equal((await deletionsTick(h.sv)).done, 1);
  h.advance(-15 * 86_400_000);
  const u = await h.sql("SELECT display_name, email, status, phone_e164 FROM users WHERE id = $1", [s.userId]);
  assert.deepEqual([u[0]!["display_name"], u[0]!["status"]], ["Deleted user", "deleted"]);
  assert.ok(String(u[0]!["email"]).endsWith("@invalid"));
  assert.equal((await h.sql("SELECT 1 FROM contacts WHERE user_id = $1", [s.userId])).length, 0, "contacts erased");
  assert.equal((await h.get(s, "/api/me")).status, 401, "sessions gone");
});

/* ---------- notifications, announcements, support ---------- */
test("support: users see only their own tickets, staff notes stay internal, replies reopen; staff answers notify the user", async () => {
  const u = await h.login("sp1", "sp1@x.com");
  const other = await h.login("sp2", "sp2@x.com");
  const agent = await h.login("spA", "spa@x.com");
  await h.setRoles(agent.userId, ["support_agent"]);
  assert.equal((await h.send(u, "/api/support/tickets", { category: "payment", subject: "Hi", body: "short" })).status, 400);
  const t = await h.json<{ id: string }>(h.send(u, "/api/support/tickets", { category: "payment", subject: "Payout question", body: "When will my payout arrive?" }));
  assert.equal((await h.get(other, `/api/support/tickets/${t.id}`)).status, 404);
  assert.equal((await h.get(u, "/api/admin/tickets")).status, 403);
  const queue = await h.json<{ items: { id: string; priority: string }[] }>(h.get(agent, "/api/admin/tickets?status=open"));
  assert.equal(queue.items.find(x => x.id === t.id)!.priority, "high", "payment tickets come first");
  await h.send(agent, `/api/admin/tickets/${t.id}/reply`, { body: "User seems legit", internal: true });
  await h.send(agent, `/api/admin/tickets/${t.id}/reply`, { body: "It is in review, usually 3 days." });
  const mine = await h.json<{ status: string; messages: { body: string; fromStaff: boolean }[] }>(h.get(u, `/api/support/tickets/${t.id}`));
  assert.equal(mine.status, "pending");
  assert.deepEqual(mine.messages.map(m => m.body), ["It is in review, usually 3 days."], "internal note hidden");
  assert.ok((await h.store.listNotifications(u.userId, 10)).some(n => n.kind === "ticket_reply"));
  await h.send(u, `/api/support/tickets/${t.id}/reply`, { body: "Thanks!" });
  assert.equal((await h.json<{ status: string }>(h.get(u, `/api/support/tickets/${t.id}`))).status, "open");
  assert.equal((await h.send(agent, `/api/admin/tickets/${t.id}`, { status: "closed", priority: "urgent", assignedTo: u.userId }, "PATCH")).status, 400, "only staff can be assigned");
  assert.equal((await h.send(agent, `/api/admin/tickets/${t.id}`, { status: "closed" }, "PATCH")).status, 200);
});

test("notifications: list, unread count, mark read; announcements are published by managers and shown in the user's language", async () => {
  const u = await h.login("nt1", "nt1@x.com");
  const mgr = await h.login("ntM", "ntm@x.com");
  await h.setRoles(mgr.userId, ["challenge_manager"]);
  await h.store.addNotification({ userId: u.userId, kind: "achievement", payload: { code: "first_contact" }, essential: false });
  let n = await h.json<{ unread: number; items: { id: string }[] }>(h.get(u, "/api/notifications"));
  assert.ok(n.unread >= 1);
  await h.send(u, "/api/notifications/read", { all: true });
  n = await h.json(h.get(u, "/api/notifications"));
  assert.equal(n.unread, 0);
  assert.equal((await h.send(u, "/api/admin/announcements", { kind: "product", title: { en: "x" }, body: { en: "y" } })).status, 403);
  const a = await h.json<{ id: string }>(h.send(mgr, "/api/admin/announcements", { kind: "feature", title: { en: "Backups", fr: "Sauvegardes" }, body: { en: "Now available", fr: "Disponibles" }, status: "published", showOnSite: true }));
  await h.send(u, "/api/me", { language: "fr" }, "PATCH");
  const feed = await h.json<{ items: { id: string; title: string }[] }>(h.get(u, "/api/announcements"));
  assert.equal(feed.items.find(x => x.id === a.id)!.title, "Sauvegardes");
  const site = await h.json<{ items: { title: string }[] }>(fetch(`${h.base}/api/public/announcements?lang=en`));
  assert.ok(site.items.some(x => x.title === "Backups"));
});

/* ---------- missions, achievements, share cards ---------- */
test("missions: progress from verified events, XP claimable once per period; achievements granted once", async () => {
  const s = await h.login("ms1", "ms1@x.com");
  for (let i = 0; i < 3; i++) await create(s, { fullName: `M${i}`, phones: [ph()] });
  const ms = await h.json<{ items: { code: string; done: boolean; claimed: boolean }[] }>(h.get(s, "/api/missions"));
  assert.ok(ms.items.find(m => m.code === "daily_organize")!.done);
  assert.equal((await h.send(s, "/api/missions/daily_label/claim", {})).status, 409, "not done");
  assert.equal((await h.send(s, "/api/missions/daily_organize/claim", {})).status, 200);
  assert.equal((await h.send(s, "/api/missions/daily_organize/claim", {})).status, 409, "once per day");
  assert.equal((await h.send(s, "/api/missions/nope/claim", {})).status, 404);
  const ach = await h.json<{ items: { code: string; earnedAt: number | null }[] }>(h.get(s, "/api/achievements"));
  assert.ok(ach.items.find(a => a.code === "first_contact")!.earnedAt);
  assert.equal((await h.sql("SELECT count(*)::int AS c FROM user_achievements WHERE user_id = $1 AND code = 'first_contact'", [s.userId]))[0]!["c"], 1);
});

test("share card: an SVG built from verified data; no e-mail, contacts or money; referral link only when asked", async () => {
  const s = await h.login("sh1", "sh1@x.com");
  await h.send(s, "/api/me", { pseudonym: "Share_Star" }, "PATCH");
  const r = await h.get(s, "/api/share/card.svg?kind=level");
  assert.match(r.headers.get("content-type")!, /image\/svg\+xml/);
  const svg = await r.text();
  assert.ok(svg.includes("@Share_Star") && svg.includes("SYRIX VCF") && !svg.includes("sh1@x.com"));
  assert.ok(!svg.includes("/register?ref="));
  assert.ok((await (await h.get(s, "/api/share/card.svg?kind=referrals&ref=1")).text()).includes("/register?ref="));
  assert.equal((await h.get(s, "/api/share/card.svg?kind=challenge&challenge=00000000-0000-0000-0000-000000000000")).status, 404, "only completed challenges");
  await h.send(s, "/api/me", { pseudonym: "Evil<script>" }, "PATCH").then(x => assert.equal(x.status, 400));
});
