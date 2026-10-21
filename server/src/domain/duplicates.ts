import type { Contact, ContactInput } from "../store/types.ts";

export type DupReason = "same_phone" | "same_email" | "same_name";
export interface DupGroup { key: string; contactIds: string[]; reasons: DupReason[] }

/** Name key: case, accents, punctuation and word order do not matter ("Moreau, Amina" = "amina moreau"). */
export function nameKey(name: string): string {
  return name.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean).sort().join(" ");
}
export const pairKey = (ids: readonly string[]) => [...ids].sort().join(":");

/**
 * Groups contacts that are probably the same person: a shared phone number or e-mail, or the same normalized name.
 * Union-find over those links. Suggestions the user dismissed (by exact group key) are left out.
 */
export function findDuplicates(contacts: readonly Contact[], dismissed: ReadonlySet<string> = new Set(), maxGroups = 200): DupGroup[] {
  const parent = new Map<string, string>(contacts.map(c => [c.id, c.id]));
  const find = (x: string): string => { let r = x; while (parent.get(r) !== r) r = parent.get(r)!; parent.set(x, r); return r; };
  const reasons = new Map<string, Set<DupReason>>();
  const link = (a: string, b: string, why: DupReason) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
    for (const id of [a, b]) { const s = reasons.get(id) ?? new Set(); s.add(why); reasons.set(id, s); }
  };
  const index = (keyOf: (c: Contact) => string[], why: DupReason) => {
    const seen = new Map<string, string>();
    for (const c of contacts) for (const k of keyOf(c)) { const o = seen.get(k); if (o) link(o, c.id, why); else seen.set(k, c.id); }
  };
  index(c => c.phones, "same_phone");
  index(c => c.emails.map(e => e.toLowerCase()), "same_email");
  index(c => { const k = nameKey(c.fullName); return k.length >= 3 ? [k] : []; }, "same_name");
  const groups = new Map<string, string[]>();
  for (const c of contacts) { if (!reasons.has(c.id)) continue; const r = find(c.id); groups.set(r, [...(groups.get(r) ?? []), c.id]); }
  const out: DupGroup[] = [];
  for (const ids of groups.values()) {
    if (ids.length < 2) continue;
    const key = pairKey(ids);
    if (dismissed.has(key)) continue;
    const why = new Set<DupReason>();
    for (const id of ids) for (const r of reasons.get(id) ?? []) why.add(r);
    out.push({ key, contactIds: ids, reasons: [...why] });
    if (out.length >= maxGroups) break;
  }
  return out;
}

/**
 * Merges several contacts into the one the user keeps (`primary`): its name stays, phone numbers and e-mails are united
 * (primary's first), empty fields are filled from the others, notes are joined. Nothing is lost.
 */
export function mergeContacts(primary: Contact, others: readonly Contact[], maxPhones = 10): ContactInput {
  const phones = [...new Set([...primary.phones, ...others.flatMap(o => o.phones)])].slice(0, maxPhones);
  const emails = [...new Set([...primary.emails, ...others.flatMap(o => o.emails)].map(e => e.toLowerCase()))].slice(0, 10);
  const first = <K extends "organization" | "title">(k: K) => primary[k] ?? others.find(o => o[k])?.[k];
  const notes = [primary.notes, ...others.map(o => o.notes)].filter((n): n is string => !!n && !!n.trim());
  const out: ContactInput = { fullName: primary.fullName, phones, emails };
  const org = first("organization"); if (org) out.organization = org;
  const title = first("title"); if (title) out.title = title;
  if (notes.length) out.notes = [...new Set(notes)].join("\n\n").slice(0, 5000);
  return out;
}
