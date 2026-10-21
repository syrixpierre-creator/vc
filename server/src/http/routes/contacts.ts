import { randomUUID } from "node:crypto";
import type { AppCtx } from "../app.ts";
import type { Contact, ContactInput, ContactListQuery } from "../../store/types.ts";
import { DuplicateError } from "../../store/types.ts";
import { HttpError, pick, readJson, readBody, v, qInt, qEnum, qUuid, EMAIL, UUID, type Ctx } from "../kit.ts";
import { normalizeE164 } from "../../domain/phone.ts";
import { generateVcf, parseVcf, MAX_PHONES, type VcfVersion, type VcfContact } from "../../domain/vcf.ts";
import { findDuplicates, mergeContacts, pairKey } from "../../domain/duplicates.ts";
import { recordActivity, recordEvent, checkAchievements } from "../../domain/progress.ts";
import { encrypt, decrypt } from "../../security/crypto.ts";
import { queueSync } from "./sync.ts";

const MAX_VCF = 5 * 1024 * 1024;
const SORTS = ["name", "-name", "created", "-created", "updated", "-updated"] as const;
const SYNC_STATES = ["local_only", "pending", "synced", "failed", "conflict", "paused"] as const;
const COLORS = ["blue", "violet", "teal", "amber", "rose", "slate"] as const;
const VERSIONS = ["2.1", "3.0", "4.0"] as const;
const day = (t: number) => new Date(t).toISOString().slice(0, 10);

export const publicContact = (x: Contact) => ({ id: x.id, fullName: x.fullName, phones: x.phones, phone: x.phones[0] ?? null, emails: x.emails, organization: x.organization ?? null,
  title: x.title ?? null, notes: x.notes ?? null, labelIds: x.labelIds, syncState: x.syncState, createdAt: x.createdAt, updatedAt: x.updatedAt });
export const toVcf = (x: Contact): VcfContact => ({ name: x.fullName, phones: x.phones, emails: x.emails, ...(x.organization ? { organization: x.organization } : {}), ...(x.title ? { title: x.title } : {}), ...(x.notes ? { note: x.notes } : {}) });
const fromVcf = (x: VcfContact): ContactInput => ({ fullName: x.name.slice(0, 200), phones: x.phones, emails: x.emails, ...(x.organization ? { organization: x.organization.slice(0, 200) } : {}),
  ...(x.title ? { title: x.title.slice(0, 200) } : {}), ...(x.note ? { notes: x.note.slice(0, 5000) } : {}) });

export function registerContacts(app: AppCtx) {
  const { router: r, store, now, send, sv } = app;
  const backupCtx = (id: string) => `contact_backup:${id}`;

  function validateContact(b: Record<string, unknown>, c: Ctx, partial: boolean): Partial<ContactInput> {
    const u = c.user!;
    const out: Partial<ContactInput> = {};
    if ("fullName" in b || !partial) out.fullName = v.str(b, "fullName", { min: 1, max: 200, required: true })!;
    let rawPhones: unknown = b["phones"];
    if (rawPhones === undefined && "phone" in b) rawPhones = b["phone"] === "" || b["phone"] === null ? [] : [b["phone"]];
    if (rawPhones !== undefined) {
      if (!Array.isArray(rawPhones) || rawPhones.length > MAX_PHONES || rawPhones.some(p => typeof p !== "string")) throw new HttpError(400, "invalid_phone");
      const phones: string[] = [];
      for (const p of rawPhones as string[]) {
        if (!p.trim()) continue;
        const e = normalizeE164(p, u.dialCode, u.countryCode);
        if (!e) throw new HttpError(400, "invalid_phone", { value: p.slice(0, 30) });
        if (!phones.includes(e)) phones.push(e);
      }
      out.phones = phones;
    } else if (!partial) out.phones = [];
    if ("emails" in b) {
      const e = b["emails"];
      if (!Array.isArray(e) || e.length > 10 || e.some(x => typeof x !== "string" || x.length > 254 || !EMAIL.test(x.trim()))) throw new HttpError(400, "invalid_emails");
      out.emails = [...new Set((e as string[]).map(x => x.trim().toLowerCase()))];
    } else if (!partial) out.emails = [];
    for (const k of ["organization", "title", "notes"] as const) if (k in b) { const s = v.str(b, k, { max: k === "notes" ? 5000 : 200 }); out[k] = s ?? ""; }
    return out;
  }
  function listQuery(c: Ctx): ContactListQuery {
    const q = c.url.searchParams.get("q")?.slice(0, 100) || undefined;
    const labelId = qUuid(c.url, "label"), syncState = qEnum(c.url, "sync", SYNC_STATES), sort = qEnum(c.url, "sort", SORTS);
    return { ...(q ? { q } : {}), ...(labelId ? { labelId } : {}), ...(syncState ? { syncState } : {}), ...(sort ? { sort } : {}), limit: qInt(c.url, "limit", 25, 1, 100), offset: qInt(c.url, "offset", 0, 0, 1_000_000) };
  }
  async function idsFromBody(c: Ctx, b: Record<string, unknown>): Promise<string[]> {
    if (Array.isArray(b["ids"])) return v.ids(b, "ids", 5000);
    const f = b["filter"];
    if (typeof f !== "object" || f === null) throw new HttpError(400, "ids_or_filter_required");
    const fb = f as Record<string, unknown>;
    pick(fb, ["q", "labelId", "syncState"]);
    const q = v.str(fb, "q", { max: 100 });
    const labelId = fb["labelId"] === undefined ? undefined : (typeof fb["labelId"] === "string" && UUID.test(fb["labelId"]) ? fb["labelId"] : (() => { throw new HttpError(400, "invalid_labelId"); })());
    const syncState = v.oneOf(fb, "syncState", SYNC_STATES);
    return store.contactIdsMatching(c.user!.id, { ...(q ? { q } : {}), ...(labelId ? { labelId } : {}), ...(syncState ? { syncState } : {}) }, 5000);
  }

  /* ---------- contacts ---------- */
  r.get("/api/contacts", { summary: "List contacts (search, label/sync filters, sort, pagination)", tag: "contacts", access: "user", query: "q, label, sync, sort, limit<=100, offset" }, async c => {
    const res = await store.listContacts(c.user!.id, listQuery(c));
    send(c, 200, { total: res.total, items: res.rows.map(publicContact) });
  });
  r.post("/api/contacts", { summary: "Create a contact (queued for Google sync when enabled)", tag: "contacts", access: "write", limit: "contactCreate",
    body: "{fullName, phones?: string[] (E.164 or national), emails?, organization?, title?, notes?, labelIds?}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["fullName", "phone", "phones", "emails", "organization", "title", "notes", "labelIds"]);
    const val = validateContact(b, c, false) as ContactInput;
    for (const k of ["organization", "title", "notes"] as const) if (!val[k]) delete val[k];
    let created: Contact;
    try { created = await store.createContact(u.id, val); }
    catch (e) { if (e instanceof DuplicateError) throw new HttpError(409, e.message === "contact limit reached" ? "contact_limit_reached" : "duplicate_phone"); throw e; }
    if (Array.isArray(b["labelIds"])) { await store.setContactLabels(u.id, created.id, v.ids(b, "labelIds", 20)); created = (await store.getContact(u.id, created.id))!; }
    await recordActivity(sv, u.id, now(), `contact:${created.id}`);
    await queueSync(app, u.id, created);
    await checkAchievements(sv, u.id);
    send(c, 201, publicContact((await store.getContact(u.id, created.id))!));
  });

  r.get("/api/contacts/export", { summary: "Export contacts as a vCard file (all, selected ids, or the current filter)", tag: "contacts", access: "user", limit: "export",
    query: "version=2.1|3.0|4.0, ids=uuid,uuid (optional), q, label, sync", produces: "text/vcard" }, async c => {
    const u = c.user!;
    const ver = qEnum(c.url, "version", VERSIONS) ?? "3.0";
    const idsParam = c.url.searchParams.get("ids");
    let list: Contact[];
    if (idsParam) {
      const ids = idsParam.split(",").filter(Boolean);
      if (ids.length > 5000 || ids.some(i => !UUID.test(i))) throw new HttpError(400, "invalid_ids");
      list = await store.getContacts(u.id, ids);
    } else {
      const q = listQuery(c);
      list = q.q || q.labelId || q.syncState ? await store.getContacts(u.id, await store.contactIdsMatching(u.id, q)) : await store.allContacts(u.id);
    }
    await recordEvent(sv, u.id, "vcf_exports", now(), `export:${day(now())}`);
    send(c, 200, generateVcf(list.map(toVcf), ver), { "Content-Type": "text/vcard; charset=utf-8", "Content-Disposition": `attachment; filename="syrix-contacts-${day(now())}.vcf"` });
  });

  r.post("/api/contacts/import", { summary: "Import a VCF file: mode=preview (nothing written) or commit; strategy=skip|merge for duplicates", tag: "contacts", access: "write", limit: "vcfImport",
    query: "mode=preview|commit, strategy=skip|merge; body: the .vcf file as text (max 5 MB)" }, async c => {
    const u = c.user!;
    const mode = c.url.searchParams.get("mode") ?? "preview";
    if (mode !== "preview" && mode !== "commit") throw new HttpError(400, "invalid_mode");
    const strategy = qEnum(c.url, "strategy", ["skip", "merge"] as const) ?? "skip";
    const text = await readBody(c.req, MAX_VCF);
    let parsed;
    try { parsed = parseVcf(text, { defaultDialCode: u.dialCode, maxBytes: MAX_VCF, maxContacts: 20_000 }); } catch { throw new HttpError(400, "invalid_vcf"); }
    if (!parsed.contacts.length && !parsed.errors.length) throw new HttpError(400, "invalid_vcf");
    const existing = await store.allContacts(u.id);
    const byPhone = new Map<string, Contact>(), byEmail = new Map<string, Contact>();
    for (const x of existing) { for (const p of x.phones) byPhone.set(p, x); for (const e of x.emails) byEmail.set(e, x); }
    // within the file, cards sharing a number are folded into the first one
    const fresh: VcfContact[] = [];
    const filePhones = new Map<string, VcfContact>();
    const matches: { incoming: VcfContact; target: Contact }[] = [];
    let duplicatesInFile = 0;
    for (const x of parsed.contacts) {
      const target = x.phones.map(p => byPhone.get(p)).find(Boolean) ?? x.emails.map(e => byEmail.get(e)).find(Boolean);
      if (target) { matches.push({ incoming: x, target }); continue; }
      const twin = x.phones.map(p => filePhones.get(p)).find(Boolean);
      if (twin) { duplicatesInFile++; for (const p of x.phones) if (!twin.phones.includes(p) && twin.phones.length < MAX_PHONES) twin.phones.push(p); for (const e of x.emails) if (!twin.emails.includes(e)) twin.emails.push(e); continue; }
      for (const p of x.phones) filePhones.set(p, x);
      fresh.push(x);
    }
    const summary = { total: parsed.contacts.length + parsed.errors.length, valid: parsed.contacts.length, toImport: fresh.length, duplicates: matches.length + duplicatesInFile,
      duplicatesExisting: matches.length, duplicatesInFile, invalid: parsed.errors.slice(0, 200), invalidCount: parsed.errors.length, ignoredExtraPhones: parsed.ignoredExtraPhones, strategy,
      sample: fresh.slice(0, 10).map(x => ({ name: x.name, phones: x.phones.length, emails: x.emails.length })) };
    if (mode === "preview") return send(c, 200, { mode, ...summary });
    if (existing.length + fresh.length > 50_000) throw new HttpError(409, "contact_limit_reached");
    let imported = 0, merged = 0;
    for (const x of fresh) {
      try { const made = await store.createContact(u.id, fromVcf(x), "import"); imported++; await queueSync(app, u.id, made); }
      catch (e) { if (!(e instanceof DuplicateError)) throw e; }
    }
    if (strategy === "merge") {
      const byTarget = new Map<string, VcfContact[]>();
      for (const m of matches) byTarget.set(m.target.id, [...(byTarget.get(m.target.id) ?? []), m.incoming]);
      for (const [id, incoming] of byTarget) {
        const target = await store.getContact(u.id, id);
        if (!target) continue;
        // add what is new (numbers not used by another contact, e-mails), fill empty fields; never overwrite what the user has
        const phones = [...target.phones], emails = [...target.emails];
        let organization = target.organization, title = target.title;
        for (const x of incoming) {
          for (const p of x.phones) if (!phones.includes(p) && (!byPhone.has(p) || byPhone.get(p)!.id === id) && phones.length < MAX_PHONES) phones.push(p);
          for (const e of x.emails) if (!emails.includes(e) && emails.length < 10) emails.push(e);
          organization ??= x.organization; title ??= x.title;
        }
        const next: Partial<ContactInput> = { phones, emails, ...(organization ? { organization } : {}), ...(title ? { title } : {}) };
        try {
          const upd = await store.updateContact(u.id, id, next, "import");
          if (upd && upd.updatedAt !== target.updatedAt) { merged++; await queueSync(app, u.id, upd); }
        } catch (e) { if (!(e instanceof DuplicateError)) throw e; }
      }
    }
    if (imported + merged > 0) {
      const opKey = randomUUID();
      await recordActivity(sv, u.id, now(), `import:${opKey}`);
      await recordEvent(sv, u.id, "vcf_imports", now(), `import:${opKey}`);
      await checkAchievements(sv, u.id);
    }
    send(c, 200, { mode, ...summary, imported, merged });
  });

  r.post("/api/contacts/bulk", { summary: "Bulk action on selected ids or on everything matching a filter: delete | label | unlabel", tag: "contacts", access: "write", limit: "bulk",
    body: "{action, ids? | filter?: {q, labelId, syncState}, labelId? (label/unlabel), confirm: true (delete)}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req, 256 * 1024), ["action", "ids", "filter", "labelId", "confirm", "preview"]);
    const action = v.oneOf(b, "action", ["delete", "label", "unlabel"] as const, true)!;
    const ids = await idsFromBody(c, b);
    if (b["preview"] === true) return send(c, 200, { action, count: ids.length });
    if (action === "delete") {
      if (b["confirm"] !== true) throw new HttpError(400, "confirmation_required");
      const n = await store.deleteContacts(u.id, ids);
      await recordActivity(sv, u.id, now(), `bulk-delete:${randomUUID()}`);
      return send(c, 200, { action, affected: n });
    }
    const labelId = typeof b["labelId"] === "string" && UUID.test(b["labelId"]) ? b["labelId"] : null;
    if (!labelId) throw new HttpError(400, "invalid_labelId");
    const changed = await store.applyLabel(u.id, labelId, ids, action === "label");
    if (action === "label") for (const id of changed) await recordEvent(sv, u.id, "contacts_labeled", now(), `label:${id}`);
    if (changed.length) await recordActivity(sv, u.id, now(), `bulk-${action}:${randomUUID()}`);
    await checkAchievements(sv, u.id);
    send(c, 200, { action, affected: changed.length });
  });

  r.get("/api/contacts/history", { summary: "Recent activity across the address book (which fields changed, never their values)", tag: "contacts", access: "user" }, async c => {
    send(c, 200, { items: await store.listHistory(c.user!.id, { limit: qInt(c.url, "limit", 50, 1, 200) }) });
  });

  /* ---------- duplicates ---------- */
  r.get("/api/contacts/duplicates", { summary: "Groups of contacts that look like the same person (shared number, e-mail or name)", tag: "contacts", access: "user" }, async c => {
    const u = c.user!;
    const all = await store.allContacts(u.id);
    const groups = findDuplicates(all, await store.dismissedPairs(u.id));
    const byId = new Map(all.map(x => [x.id, x]));
    send(c, 200, { items: groups.map(g => ({ key: g.key, reasons: g.reasons, contacts: g.contactIds.map(id => publicContact(byId.get(id)!)) })) });
  });
  r.post("/api/contacts/merge", { summary: "Merge duplicates into one contact (numbers, e-mails and notes are united; nothing is lost)", tag: "contacts", access: "write", limit: "bulk",
    body: "{primaryId, otherIds: uuid[]}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["primaryId", "otherIds"]);
    if (typeof b["primaryId"] !== "string" || !UUID.test(b["primaryId"])) throw new HttpError(400, "invalid_primaryId");
    const otherIds = v.ids(b, "otherIds", 20).filter(id => id !== b["primaryId"]);
    if (!otherIds.length) throw new HttpError(400, "invalid_otherIds");
    const result = await store.tx(async s => {
      await s.lock(`contacts:${u.id}`);
      const primary = await s.getContact(u.id, b["primaryId"] as string);
      const others = await s.getContacts(u.id, otherIds);
      if (!primary || others.length !== otherIds.length) throw new HttpError(404, "not_found");
      const merged = mergeContacts(primary, others);
      await s.deleteContacts(u.id, otherIds, "merge"); // first free their numbers, then give them to the primary
      for (const o of others) for (const l of o.labelIds) await s.applyLabel(u.id, l, [primary.id], true);
      const upd = await s.updateContact(u.id, primary.id, merged, "merge");
      await s.addHistory(u.id, primary.id, "merged", [], "app");
      return upd!;
    });
    await recordEvent(sv, u.id, "duplicates_reviewed", now(), `dup:${pairKey([b["primaryId"] as string, ...otherIds])}`);
    await recordActivity(sv, u.id, now(), `merge:${result.id}:${result.updatedAt}`);
    await queueSync(app, u.id, result);
    send(c, 200, publicContact(result));
  });
  r.post("/api/contacts/duplicates/dismiss", { summary: "Mark a suggested group as different people", tag: "contacts", access: "write", body: "{key}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["key"]);
    const key = v.str(b, "key", { max: 900, required: true, pattern: /^[0-9a-f-]{36}(:[0-9a-f-]{36})+$/ })!;
    const ids = key.split(":");
    if ((await store.getContacts(u.id, ids)).length !== ids.length) throw new HttpError(404, "not_found");
    if (await store.dismissPair(u.id, key)) await recordEvent(sv, u.id, "duplicates_reviewed", now(), `dup:${key}`);
    send(c, 200, { ok: true });
  });

  /* ---------- one contact ---------- */
  r.get("/api/contacts/:id", { summary: "One contact", tag: "contacts", access: "user" }, async c => {
    const x = await store.getContact(c.user!.id, c.params["id"]!);
    if (!x) throw new HttpError(404, "not_found"); // other users' ids look exactly like missing ones
    send(c, 200, publicContact(x));
  });
  r.patch("/api/contacts/:id", { summary: "Edit a contact", tag: "contacts", access: "write", limit: "contactCreate", body: "any of {fullName, phones, emails, organization, title, notes}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["fullName", "phone", "phones", "emails", "organization", "title", "notes"]);
    let x;
    try { x = await store.updateContact(u.id, c.params["id"]!, validateContact(b, c, true)); }
    catch (e) { if (e instanceof DuplicateError) throw new HttpError(409, "duplicate_phone"); throw e; }
    if (!x) throw new HttpError(404, "not_found");
    await recordActivity(sv, u.id, now(), `edit:${x.id}:${x.updatedAt}`);
    await queueSync(app, u.id, x);
    send(c, 200, publicContact(x));
  });
  r.delete("/api/contacts/:id", { summary: "Delete a contact (?confirm=true). Never deletes anything in Google Contacts.", tag: "contacts", access: "write" }, async c => {
    if (c.url.searchParams.get("confirm") !== "true") throw new HttpError(400, "confirmation_required");
    if (!(await store.deleteContact(c.user!.id, c.params["id"]!))) throw new HttpError(404, "not_found");
    await recordActivity(sv, c.user!.id, now(), `delete:${c.params["id"]}`);
    send(c, 200, { ok: true });
  });
  r.get("/api/contacts/:id/history", { summary: "Change history of one contact", tag: "contacts", access: "user" }, async c => {
    if (!(await store.getContact(c.user!.id, c.params["id"]!))) throw new HttpError(404, "not_found");
    send(c, 200, { items: await store.listHistory(c.user!.id, { contactId: c.params["id"]!, limit: 100 }) });
  });
  r.put("/api/contacts/:id/labels", { summary: "Set the labels of one contact", tag: "contacts", access: "write", body: "{labelIds: uuid[]}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["labelIds"]);
    const ids = v.ids(b, "labelIds", 20);
    const own = new Set((await store.listLabels(u.id)).map(l => l.id));
    if (ids.some(i => !own.has(i))) throw new HttpError(404, "label_not_found");
    const before = await store.getContact(u.id, c.params["id"]!);
    if (!before) throw new HttpError(404, "not_found");
    await store.setContactLabels(u.id, before.id, ids);
    if (ids.length) { await recordEvent(sv, u.id, "contacts_labeled", now(), `label:${before.id}`); await recordActivity(sv, u.id, now(), `labels:${before.id}:${ids.join(",")}`); await checkAchievements(sv, u.id); }
    send(c, 200, publicContact((await store.getContact(u.id, before.id))!));
  });

  /* ---------- labels ---------- */
  r.get("/api/labels", { summary: "The user's labels with contact counts", tag: "contacts", access: "user" }, async c => send(c, 200, { items: await store.listLabels(c.user!.id) }));
  r.post("/api/labels", { summary: "Create a label", tag: "contacts", access: "write", body: "{name, color?}" }, async c => {
    const b = pick(await readJson(c.req), ["name", "color"]);
    const name = v.str(b, "name", { min: 1, max: 60, required: true })!;
    const color = v.oneOf(b, "color", COLORS) ?? "blue";
    try { send(c, 201, { id: await store.createLabel(c.user!.id, name, color), name, color }); }
    catch (e) { if (e instanceof DuplicateError) throw new HttpError(409, e.message === "label exists" ? "label_exists" : "label_limit_reached"); throw e; }
  });
  r.patch("/api/labels/:id", { summary: "Rename or recolor a label", tag: "contacts", access: "write", body: "{name?, color?}" }, async c => {
    const b = pick(await readJson(c.req), ["name", "color"]);
    const name = v.str(b, "name", { min: 1, max: 60 }), color = v.oneOf(b, "color", COLORS);
    try { if (!(await store.updateLabel(c.user!.id, c.params["id"]!, { ...(name ? { name } : {}), ...(color ? { color } : {}) }))) throw new HttpError(404, "not_found"); }
    catch (e) { if (e instanceof DuplicateError) throw new HttpError(409, "label_exists"); throw e; }
    send(c, 200, { ok: true });
  });
  r.delete("/api/labels/:id", { summary: "Delete a label (contacts are kept)", tag: "contacts", access: "write" }, async c => {
    if (!(await store.deleteLabel(c.user!.id, c.params["id"]!))) throw new HttpError(404, "not_found");
    send(c, 200, { ok: true });
  });

  /* ---------- backups (encrypted VCF, restore never overwrites or deletes) ---------- */
  async function makeBackup(userId: string, kind: "manual" | "automatic" | "before_restore", label?: string) {
    const all = await store.allContacts(userId);
    const vcf = generateVcf(all.map(toVcf), "4.0");
    const id = randomUUID();
    await store.createBackup({ id, userId, kind, ...(label ? { label } : {}), contactCount: all.length, vcardVersion: "4.0", sizeBytes: Buffer.byteLength(vcf),
      payloadEnc: encrypt(vcf, app.deps.keyRing, backupCtx(id)), ...(kind === "manual" ? {} : { expiresAt: now() + 30 * 86_400_000 }) });
    return { id, contactCount: all.length };
  }
  const publicBackup = (b: Awaited<ReturnType<typeof store.listBackups>>[number]) => ({ id: b.id, kind: b.kind, label: b.label ?? null, contactCount: b.contactCount, vcardVersion: b.vcardVersion,
    sizeBytes: b.sizeBytes, createdAt: b.createdAt, expiresAt: b.expiresAt ?? null, restoredAt: b.restoredAt ?? null });
  async function readBackup(c: Ctx) {
    const b = await store.getBackup(c.user!.id, c.params["id"]!);
    if (!b) throw new HttpError(404, "not_found");
    return { b, vcf: decrypt(b.payloadEnc!, app.deps.keyRing, backupCtx(b.id)) };
  }
  async function restorePlan(userId: string, vcf: string) {
    const parsed = parseVcf(vcf, { maxBytes: 50 * 1024 * 1024, maxContacts: 60_000 });
    const existing = await store.allContacts(userId);
    const phones = new Set(existing.flatMap(x => x.phones)), emails = new Set(existing.flatMap(x => x.emails));
    const names = new Set(existing.map(x => x.fullName.trim().toLowerCase()));
    const missing: VcfContact[] = [];
    let present = 0;
    for (const x of parsed.contacts) {
      const there = x.phones.some(p => phones.has(p)) || x.emails.some(e => emails.has(e)) || (!x.phones.length && !x.emails.length && names.has(x.name.trim().toLowerCase()));
      if (there) present++; else missing.push(x);
    }
    return { missing, present, invalid: parsed.errors.length };
  }

  r.get("/api/backups", { summary: "List backups", tag: "backups", access: "user" }, async c => send(c, 200, { items: (await store.listBackups(c.user!.id)).map(publicBackup) }));
  r.post("/api/backups", { summary: "Create an encrypted backup of every contact", tag: "backups", access: "write", limit: "backup", body: "{label?}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["label"]);
    const label = v.str(b, "label", { max: 80 });
    if ((await store.countBackups(u.id)) >= 60) throw new HttpError(409, "backup_limit_reached");
    const made = await makeBackup(u.id, "manual", label);
    await recordEvent(sv, u.id, "backups_created", now(), `backup:${made.id}`);
    await recordEvent(sv, u.id, "security_tasks", now(), `sec:backup:${new Date(now()).toISOString().slice(0, 7)}`);
    await recordActivity(sv, u.id, now(), `backup:${made.id}`);
    await checkAchievements(sv, u.id);
    send(c, 201, { id: made.id, contactCount: made.contactCount });
  });
  r.get("/api/backups/:id/download", { summary: "Download a backup as a vCard 4.0 file", tag: "backups", access: "user", limit: "export", produces: "text/vcard" }, async c => {
    const { b, vcf } = await readBackup(c);
    send(c, 200, vcf, { "Content-Type": "text/vcard; charset=utf-8", "Content-Disposition": `attachment; filename="syrix-backup-${new Date(b.createdAt).toISOString().slice(0, 10)}.vcf"` });
  });
  r.get("/api/backups/:id/preview", { summary: "What a restore would add (contacts missing today); nothing is changed", tag: "backups", access: "user" }, async c => {
    const { b, vcf } = await readBackup(c);
    const plan = await restorePlan(c.user!.id, vcf);
    send(c, 200, { id: b.id, inBackup: b.contactCount, toRestore: plan.missing.length, alreadyPresent: plan.present, invalid: plan.invalid, sample: plan.missing.slice(0, 10).map(x => x.name) });
  });
  r.post("/api/backups/:id/restore", { summary: "Restore: re-creates contacts missing today. Existing contacts are never overwritten or deleted; a safety backup is taken first.", tag: "backups",
    access: "write", limit: "backup", body: "{confirm: true}" }, async c => {
    const u = c.user!;
    const body = pick(await readJson(c.req), ["confirm"]);
    if (body["confirm"] !== true) throw new HttpError(400, "confirmation_required");
    const { b, vcf } = await readBackup(c);
    const plan = await restorePlan(u.id, vcf);
    const safety = plan.missing.length ? await makeBackup(u.id, "before_restore", `Before restoring ${new Date(b.createdAt).toISOString().slice(0, 10)}`) : null;
    let restored = 0;
    for (const x of plan.missing) {
      try { const made = await store.createContact(u.id, fromVcf(x), "restore"); restored++; await queueSync(app, u.id, made); }
      catch (e) { if (!(e instanceof DuplicateError)) throw e; }
    }
    await store.markBackupRestored(u.id, b.id);
    if (restored) await recordActivity(sv, u.id, now(), `restore:${b.id}:${now()}`);
    send(c, 200, { restored, skippedExisting: plan.present, safetyBackupId: safety?.id ?? null });
  });
  r.delete("/api/backups/:id", { summary: "Delete a backup (?confirm=true)", tag: "backups", access: "write" }, async c => {
    if (c.url.searchParams.get("confirm") !== "true") throw new HttpError(400, "confirmation_required");
    if (!(await store.deleteBackup(c.user!.id, c.params["id"]!))) throw new HttpError(404, "not_found");
    send(c, 200, { ok: true });
  });
}

/** Used by the worker for weekly automatic backups. */
export async function automaticBackup(app: Pick<AppCtx, "store" | "now"> & { keyRing: AppCtx["deps"]["keyRing"] }, userId: string) {
  const all = await app.store.allContacts(userId);
  const vcf = generateVcf(all.map(toVcf), "4.0");
  const id = randomUUID();
  await app.store.createBackup({ id, userId, kind: "automatic", contactCount: all.length, vcardVersion: "4.0", sizeBytes: Buffer.byteLength(vcf),
    payloadEnc: encrypt(vcf, app.keyRing, `contact_backup:${id}`), expiresAt: app.now() + 30 * 86_400_000 });
  return id;
}
