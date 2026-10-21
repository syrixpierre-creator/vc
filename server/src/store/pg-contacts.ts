import type { Row } from "./db.ts";
import type { Contact, ContactInput, ContactListQuery, Label, HistoryRow, BackupRow } from "./types.ts";
import { DuplicateError } from "./types.ts";
import { PgUsers } from "./pg-users.ts";
import { ms, num, optMs, escapeLike, d } from "./pg-base.ts";

export const MAX_CONTACTS_PER_USER = 50_000;

const CONTACT_COLS = `c.id, c.user_id, c.full_name, c.phones, c.emails, c.organization, c.job_title, c.notes, c.sync_state, c.google_resource_name, c.google_etag,
  ${ms("c.created_at")} AS created_ms, ${ms("c.updated_at")} AS updated_ms,
  COALESCE((SELECT array_agg(l.label_id ORDER BY l.label_id) FROM contact_label_links l WHERE l.contact_id = c.id), '{}') AS label_ids`;
function mapContact(r: Row): Contact {
  const c: Contact = { id: r.id, userId: r.user_id, fullName: r.full_name, phones: r.phones ?? [], emails: r.emails ?? [], syncState: r.sync_state, labelIds: r.label_ids ?? [],
    createdAt: num(r.created_ms), updatedAt: num(r.updated_ms) };
  if (r.organization) c.organization = r.organization;
  if (r.job_title) c.title = r.job_title;
  if (r.notes) c.notes = r.notes;
  if (r.google_resource_name) c.googleResourceName = r.google_resource_name;
  if (r.google_etag) c.googleEtag = r.google_etag;
  return c;
}
const PATCH_COLUMNS: Record<string, string> = { fullName: "full_name", emails: "emails", organization: "organization", title: "job_title", notes: "notes" };
const SORTS: Record<string, string> = { name: "lower(c.full_name), c.id", "-name": "lower(c.full_name) DESC, c.id", created: "c.created_at, c.id", "-created": "c.created_at DESC, c.id",
  updated: "c.updated_at, c.id", "-updated": "c.updated_at DESC, c.id" };

export class PgContacts extends PgUsers {
  /* ---- contacts: every statement is scoped by user_id ---- */
  async allContacts(userId: string): Promise<Contact[]> {
    return (await this.all(`SELECT ${CONTACT_COLS} FROM contacts c WHERE c.user_id = $1 AND c.deleted_at IS NULL ORDER BY lower(c.full_name), c.id`, [userId])).map(mapContact);
  }
  async countContacts(userId: string) { return num((await this.one("SELECT count(*) AS c FROM contacts WHERE user_id = $1 AND deleted_at IS NULL", [userId]))?.["c"] ?? 0); }
  async listContacts(userId: string, o: ContactListQuery) {
    const like = o.q ? `%${escapeLike(o.q)}%` : null;
    const digits = o.q && /\d{3,}/.test(o.q) ? `%${o.q.replace(/\D/g, "")}%` : null;
    const where = `c.user_id = $1 AND c.deleted_at IS NULL
      AND ($2::text IS NULL OR c.full_name ILIKE $2 ESCAPE '\\' OR c.organization ILIKE $2 ESCAPE '\\' OR array_to_string(c.emails, ' ') ILIKE $2 ESCAPE '\\' OR ($5::text IS NOT NULL AND array_to_string(c.phones, ' ') LIKE $5))
      AND ($3::uuid IS NULL OR EXISTS (SELECT 1 FROM contact_label_links l WHERE l.contact_id = c.id AND l.label_id = $3))
      AND ($4::text IS NULL OR c.sync_state = $4)`;
    const params = [userId, like, o.labelId ?? null, o.syncState ?? null, digits];
    const rows = await this.all(`SELECT ${CONTACT_COLS} FROM contacts c WHERE ${where} ORDER BY ${SORTS[o.sort ?? "name"]} LIMIT $6 OFFSET $7`, [...params, o.limit, o.offset]);
    const total = num((await this.one(`SELECT count(*) AS c FROM contacts c WHERE ${where}`, params))?.["c"] ?? 0);
    return { rows: rows.map(mapContact), total };
  }
  /** Ids matching a filter (for "export / label / delete everything that matches"), capped. */
  async contactIdsMatching(userId: string, o: Omit<ContactListQuery, "limit" | "offset" | "sort">, cap = MAX_CONTACTS_PER_USER) {
    const r = await this.listContacts(userId, { ...o, limit: cap, offset: 0 });
    return r.rows.map(c => c.id);
  }
  async getContact(userId: string, id: string) { const r = await this.one(`SELECT ${CONTACT_COLS} FROM contacts c WHERE c.user_id = $1 AND c.id = $2 AND c.deleted_at IS NULL`, [userId, id]); return r ? mapContact(r) : null; }
  async getContacts(userId: string, ids: readonly string[]) {
    if (!ids.length) return [];
    return (await this.all(`SELECT ${CONTACT_COLS} FROM contacts c WHERE c.user_id = $1 AND c.id = ANY($2::uuid[]) AND c.deleted_at IS NULL ORDER BY lower(c.full_name)`, [userId, ids])).map(mapContact);
  }
  /** Which of these numbers are already in the user's address book (on any contact, except `exceptId`). */
  async phonesInUse(userId: string, phones: readonly string[], exceptId?: string): Promise<string[]> {
    if (!phones.length) return [];
    const r = await this.all("SELECT DISTINCT p FROM contacts c, unnest(c.phones) p WHERE c.user_id = $1 AND c.deleted_at IS NULL AND c.phones && $2::text[] AND ($3::uuid IS NULL OR c.id <> $3) AND p = ANY($2::text[])",
      [userId, phones, exceptId ?? null]);
    return r.map(x => x["p"] as string);
  }
  /**
   * Creates a contact. Refuses a number that is already on another of the user's contacts (DuplicateError),
   * checked under a per-user lock so two parallel saves cannot both pass the check.
   */
  async createContact(userId: string, c: ContactInput, source = "app"): Promise<Contact> {
    return this.tx(async s => {
      await s.lock(`contacts:${userId}`);
      if ((await s.phonesInUse(userId, c.phones)).length) throw new DuplicateError("duplicate phone");
      if ((await s.countContacts(userId)) >= MAX_CONTACTS_PER_USER) throw new DuplicateError("contact limit reached");
      const t = d(this.now());
      const r = await s.uniqueOr(() => s.one(`INSERT INTO contacts (user_id, full_name, phones, phone_e164, emails, organization, job_title, notes, created_at, updated_at)
        VALUES ($1, $2, $3::text[], ($3::text[])[1], $4, $5, $6, $7, $8, $8) RETURNING id`, [userId, c.fullName, c.phones, c.emails, c.organization ?? null, c.title ?? null, c.notes ?? null, t]), "duplicate phone");
      await s.addHistory(userId, r!["id"], "created", [], source);
      return (await s.getContact(userId, r!["id"] as string))!;
    });
  }
  async updateContact(userId: string, id: string, patch: Partial<ContactInput>, source = "app"): Promise<Contact | null> {
    return this.tx(async s => {
      await s.lock(`contacts:${userId}`);
      const before = await s.getContact(userId, id);
      if (!before) return null;
      if (patch.phones && (await s.phonesInUse(userId, patch.phones, id)).length) throw new DuplicateError("duplicate phone");
      const sets: string[] = []; const params: unknown[] = [userId, id];
      const changed: string[] = [];
      for (const [k, col] of Object.entries(PATCH_COLUMNS)) { // column names come from the constant map, never from input
        if (k in patch) { params.push((patch as Record<string, unknown>)[k] ?? null); sets.push(`${col} = $${params.length}`); if (JSON.stringify((before as unknown as Record<string, unknown>)[k] ?? null) !== JSON.stringify((patch as Record<string, unknown>)[k] ?? null)) changed.push(k); }
      }
      if (patch.phones) { params.push(patch.phones); sets.push(`phones = $${params.length}::text[], phone_e164 = ($${params.length}::text[])[1]`); if (JSON.stringify(before.phones) !== JSON.stringify(patch.phones)) changed.push("phones"); }
      if (!sets.length || !changed.length) return before; // nothing changed: no new version, no new sync job
      params.push(d(this.now()));
      await s.uniqueOr(() => s.db.query(`UPDATE contacts SET ${sets.join(", ")}, updated_at = $${params.length} WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL`, params), "duplicate phone");
      await s.addHistory(userId, id, "updated", changed, source);
      return s.getContact(userId, id);
    });
  }
  async deleteContacts(userId: string, ids: readonly string[], source = "app"): Promise<number> {
    if (!ids.length) return 0;
    return this.tx(async s => {
      const r = await s.all("UPDATE contacts SET deleted_at = $3 WHERE user_id = $1 AND id = ANY($2::uuid[]) AND deleted_at IS NULL RETURNING id", [userId, ids, d(this.now())]);
      for (const x of r) await s.addHistory(userId, x["id"], "deleted", [], source);
      // their pending sync jobs have nothing to send any more
      await s.db.query("UPDATE contact_sync_jobs SET status = 'dead', last_error = 'contact_deleted', updated_at = now() WHERE user_id = $1 AND contact_id = ANY($2::uuid[]) AND status IN ('pending','failed')", [userId, r.map(x => x["id"])]);
      return r.length;
    });
  }
  async deleteContact(userId: string, id: string) { return (await this.deleteContacts(userId, [id])) > 0; }
  async purgeDeletedContacts(olderThan: number) { return (await this.db.query("DELETE FROM contacts WHERE deleted_at IS NOT NULL AND deleted_at < $1", [d(olderThan)])).rowCount; }

  /* ---- labels ---- */
  async listLabels(userId: string): Promise<Label[]> {
    return (await this.all(`SELECT l.id, l.name, l.color, (SELECT count(*) FROM contact_label_links k JOIN contacts c ON c.id = k.contact_id AND c.deleted_at IS NULL WHERE k.label_id = l.id) AS n
      FROM contact_labels l WHERE l.user_id = $1 ORDER BY lower(l.name)`, [userId])).map(x => ({ id: x["id"], name: x["name"], color: x["color"], count: num(x["n"]) }));
  }
  async createLabel(userId: string, name: string, color: string) {
    if (num((await this.one("SELECT count(*) AS c FROM contact_labels WHERE user_id = $1", [userId]))?.["c"]) >= 100) throw new DuplicateError("label limit reached");
    const r = await this.uniqueOr(() => this.one("INSERT INTO contact_labels (user_id, name, color, created_at) VALUES ($1, $2, $3, $4) RETURNING id", [userId, name, color, d(this.now())]), "label exists");
    return r!["id"] as string;
  }
  async updateLabel(userId: string, id: string, p: { name?: string; color?: string }) {
    return (await this.uniqueOr(() => this.db.query("UPDATE contact_labels SET name = COALESCE($3, name), color = COALESCE($4, color) WHERE user_id = $1 AND id = $2", [userId, id, p.name ?? null, p.color ?? null]), "label exists")).rowCount > 0;
  }
  async deleteLabel(userId: string, id: string) { return (await this.db.query("DELETE FROM contact_labels WHERE user_id = $1 AND id = $2", [userId, id])).rowCount > 0; }
  /** Adds or removes a label on the user's own contacts only. Returns the ids that actually changed. */
  async applyLabel(userId: string, labelId: string, contactIds: readonly string[], add: boolean): Promise<string[]> {
    const own = await this.one("SELECT 1 FROM contact_labels WHERE user_id = $1 AND id = $2", [userId, labelId]);
    if (!own || !contactIds.length) return [];
    const r = add
      ? await this.all(`INSERT INTO contact_label_links (contact_id, label_id) SELECT c.id, $2 FROM contacts c WHERE c.user_id = $1 AND c.id = ANY($3::uuid[]) AND c.deleted_at IS NULL
          ON CONFLICT DO NOTHING RETURNING contact_id`, [userId, labelId, contactIds])
      : await this.all(`DELETE FROM contact_label_links k USING contacts c WHERE k.contact_id = c.id AND c.user_id = $1 AND k.label_id = $2 AND c.id = ANY($3::uuid[]) RETURNING k.contact_id`, [userId, labelId, contactIds]);
    const ids = r.map(x => x["contact_id"] as string);
    for (const id of ids) await this.addHistory(userId, id, add ? "labeled" : "unlabeled", ["labels"], "app");
    return ids;
  }
  async setContactLabels(userId: string, contactId: string, labelIds: readonly string[]) {
    await this.tx(async s => {
      const c = await s.getContact(userId, contactId);
      if (!c) return;
      for (const l of c.labelIds.filter(x => !labelIds.includes(x))) await s.applyLabel(userId, l, [contactId], false);
      for (const l of labelIds.filter(x => !c.labelIds.includes(x))) await s.applyLabel(userId, l, [contactId], true);
    });
  }

  /* ---- history (which fields changed, never their values) ---- */
  async addHistory(userId: string, contactId: string, action: string, fields: string[], source: string) {
    await this.db.query("INSERT INTO contact_change_history (contact_id, user_id, action, fields, source, created_at) VALUES ($1, $2, $3, $4, $5, $6)", [contactId, userId, action, fields, source, d(this.now())]);
  }
  async listHistory(userId: string, o: { contactId?: string; limit: number }): Promise<HistoryRow[]> {
    return (await this.all(`SELECT contact_id, action, fields, source, ${ms("created_at")} AS at FROM contact_change_history WHERE user_id = $1 AND ($2::uuid IS NULL OR contact_id = $2) ORDER BY created_at DESC, id DESC LIMIT $3`,
      [userId, o.contactId ?? null, o.limit])).map(x => ({ contactId: x["contact_id"], action: x["action"], fields: x["fields"], source: x["source"], at: num(x["at"]) }));
  }

  /* ---- duplicate suggestions the user dismissed ---- */
  async dismissedPairs(userId: string): Promise<Set<string>> { return new Set((await this.all("SELECT pair_key FROM contact_duplicate_dismissals WHERE user_id = $1", [userId])).map(x => x["pair_key"] as string)); }
  async dismissPair(userId: string, key: string) { return (await this.db.query("INSERT INTO contact_duplicate_dismissals (user_id, pair_key, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [userId, key, d(this.now())])).rowCount > 0; }

  /* ---- backups (encrypted VCF) ---- */
  private mapBackup(x: Row, withPayload: boolean): BackupRow {
    const b: BackupRow = { id: x["id"], userId: x["user_id"], kind: x["kind"], contactCount: num(x["contact_count"]), vcardVersion: x["vcard_version"], sizeBytes: num(x["size_bytes"]), createdAt: num(x["c"]) };
    if (x["label"]) b.label = x["label"];
    const e = optMs(x["e"]); if (e !== undefined) b.expiresAt = e;
    const r = optMs(x["r"]); if (r !== undefined) b.restoredAt = r;
    if (withPayload) b.payloadEnc = x["payload_enc"];
    return b;
  }
  private static BACKUP_COLS = `id, user_id, kind, label, contact_count, vcard_version, size_bytes, ${ms("created_at")} AS c, ${ms("expires_at")} AS e, ${ms("restored_at")} AS r`;
  async createBackup(b: Omit<BackupRow, "createdAt"> & { payloadEnc: string }) {
    await this.db.query("INSERT INTO contact_backups (id, user_id, kind, label, contact_count, vcard_version, size_bytes, payload_enc, created_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [b.id, b.userId, b.kind, b.label ?? null, b.contactCount, b.vcardVersion, b.sizeBytes, b.payloadEnc, d(this.now()), d(b.expiresAt)]);
  }
  async listBackups(userId: string) { return (await this.all(`SELECT ${PgContacts.BACKUP_COLS} FROM contact_backups WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`, [userId])).map(x => this.mapBackup(x, false)); }
  async getBackup(userId: string, id: string) { const x = await this.one(`SELECT ${PgContacts.BACKUP_COLS}, payload_enc FROM contact_backups WHERE user_id = $1 AND id = $2`, [userId, id]); return x ? this.mapBackup(x, true) : null; }
  async deleteBackup(userId: string, id: string) { return (await this.db.query("DELETE FROM contact_backups WHERE user_id = $1 AND id = $2", [userId, id])).rowCount > 0; }
  async markBackupRestored(userId: string, id: string) { await this.db.query("UPDATE contact_backups SET restored_at = $3 WHERE user_id = $1 AND id = $2", [userId, id, d(this.now())]); }
  async countBackups(userId: string) { return num((await this.one("SELECT count(*) AS c FROM contact_backups WHERE user_id = $1", [userId]))?.["c"] ?? 0); }
  /** Retention: expired backups go, and at most `keep` automatic ones are kept per user. */
  async pruneBackups(keepAutomatic: number) {
    const a = (await this.db.query("DELETE FROM contact_backups WHERE expires_at IS NOT NULL AND expires_at < $1", [d(this.now())])).rowCount;
    const b = (await this.db.query(`DELETE FROM contact_backups WHERE id IN (SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS n FROM contact_backups WHERE kind = 'automatic') x WHERE n > $1)`, [keepAutomatic])).rowCount;
    return a + b;
  }
}
