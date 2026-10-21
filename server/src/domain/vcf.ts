import { normalizeE164 } from "./phone.ts";

export type VcfVersion = "2.1" | "3.0" | "4.0";

export interface VcfContact {
  name: string;
  /** One phone number per contact, E.164 */
  phone?: string;
  emails: string[];
  organization?: string;
  title?: string;
  note?: string;
}

export interface VcfParseError { index: number; reason: string }
export interface VcfParseResult {
  contacts: VcfContact[];
  errors: VcfParseError[];
  /** extra TEL lines beyond the first one are not imported (one number per contact) */
  ignoredExtraPhones: number;
}
export interface VcfParseOptions { maxBytes?: number; maxContacts?: number; defaultDialCode?: string }

const enc = new TextEncoder();

/* ---------- generation ---------- */

const stripControl = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

function esc(s: string): string {
  return stripControl(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");
}

function qp(s: string): string {
  const bytes = enc.encode(stripControl(s).replace(/\r\n|\r|\n/g, "\n"));
  let out = "";
  for (const b of bytes) {
    if (b === 10) out += "=0D=0A";
    else if ((b >= 33 && b <= 126 && b !== 61) || b === 32) out += String.fromCharCode(b);
    else out += "=" + b.toString(16).toUpperCase().padStart(2, "0");
  }
  return out;
}

/** Fold at 75 octets (RFC 6350 / 2426) without splitting a UTF-8 character. */
function fold(line: string): string {
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let cur = "";
  let curBytes = 0;
  let limit = 75;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (curBytes + n > limit) {
      parts.push(cur);
      cur = "";
      curBytes = 0;
      limit = 74; // continuation lines start with one space
    }
    cur += ch;
    curBytes += n;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}

function splitName(full: string): { family: string; given: string } {
  const words = full.trim().split(/\s+/);
  if (words.length === 1) return { family: "", given: words[0] ?? "" };
  return { family: words[words.length - 1] ?? "", given: words.slice(0, -1).join(" ") };
}

function prop(version: VcfVersion, name: string, value: string, params = ""): string {
  const p = params ? ";" + params : "";
  if (version === "2.1") {
    const nonAscii = /[^\x20-\x7E]/.test(value);
    if (nonAscii) return `${name}${p};CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${qp(value)}`;
    return `${name}${p}:${stripControl(value).replace(/;/g, "\\;")}`;
  }
  return fold(`${name}${p}:${esc(value)}`);
}

export function generateVcf(contacts: readonly VcfContact[], version: VcfVersion = "3.0"): string {
  const out: string[] = [];
  for (const c of contacts) {
    const { family, given } = splitName(c.name);
    out.push("BEGIN:VCARD", `VERSION:${version}`);
    if (version === "2.1") {
      const nonAscii = /[^\x20-\x7E]/.test(c.name);
      out.push(nonAscii
        ? `N;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${qp(family)};${qp(given)};;;`
        : `N:${family.replace(/;/g, "\\;")};${given.replace(/;/g, "\\;")};;;`);
    } else {
      out.push(fold(`N:${esc(family)};${esc(given)};;;`));
    }
    out.push(prop(version, "FN", c.name));
    if (c.phone) {
      out.push(version === "4.0" ? `TEL;VALUE=uri;TYPE=cell:tel:${c.phone}` : `TEL;TYPE=CELL:${c.phone}`);
    }
    for (const e of c.emails) out.push(prop(version, "EMAIL", e, "TYPE=INTERNET"));
    if (c.organization) out.push(prop(version, "ORG", c.organization));
    if (c.title) out.push(prop(version, "TITLE", c.title));
    if (c.note) out.push(prop(version, "NOTE", c.note));
    out.push("END:VCARD");
  }
  return out.join("\r\n") + (out.length ? "\r\n" : "");
}

/* ---------- parsing ---------- */

function unescapeValue(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "\\" && i + 1 < s.length) {
      const nx = s[i + 1];
      out += nx === "n" || nx === "N" ? "\n" : (nx ?? "");
      i++;
    } else out += ch;
  }
  return out;
}

function decodeQp(s: string, charset: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(s.slice(i + 1, i + 3))) {
      bytes.push(parseInt(s.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      for (const b of enc.encode(s[i] ?? "")) bytes.push(b);
    }
  }
  const label = /8859-1|latin1/i.test(charset) ? "iso-8859-1" : "utf-8";
  return new TextDecoder(label).decode(new Uint8Array(bytes)).replace(/\r\n|\r/g, "\n");
}

/** Split on ';' that are not escaped. */
function splitUnescaped(s: string): string[] {
  const parts: string[] = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i] ?? "";
    if (ch === "\\" && i + 1 < s.length) { cur += ch + (s[i + 1] ?? ""); i++; }
    else if (ch === ";") { parts.push(cur); cur = ""; }
    else cur += ch;
  }
  parts.push(cur);
  return parts;
}

function unfold(text: string): string[] {
  const raw = text.replace(/\r\n|\r/g, "\n").split("\n");
  const lines: string[] = [];
  for (const l of raw) {
    const prev = lines[lines.length - 1];
    if ((l.startsWith(" ") || l.startsWith("\t")) && prev !== undefined) lines[lines.length - 1] = prev + l.slice(1);
    else if (prev !== undefined && /;ENCODING=QUOTED-PRINTABLE/i.test(prev) && prev.endsWith("=")) {
      lines[lines.length - 1] = prev.slice(0, -1) + l; // QP soft line break
    } else lines.push(l);
  }
  return lines;
}

export function parseVcf(text: string, opts: VcfParseOptions = {}): VcfParseResult {
  const maxBytes = opts.maxBytes ?? 5 * 1024 * 1024;
  const maxContacts = opts.maxContacts ?? 50_000;
  if (enc.encode(text).length > maxBytes) throw new RangeError("VCF file is too large");

  const res: VcfParseResult = { contacts: [], errors: [], ignoredExtraPhones: 0 };
  let index = -1;
  let inCard = false;
  let card: { fn?: string; n?: string; phones: string[]; emails: string[]; org?: string; title?: string; note?: string } | null = null;

  const finish = () => {
    if (!card) return;
    const c = card;
    card = null;
    inCard = false;
    const name = (c.fn ?? c.n ?? "").trim();
    if (!name) { res.errors.push({ index, reason: "missing name" }); return; }
    let phone: string | undefined;
    if (c.phones.length) {
      const n = normalizeE164(c.phones[0] ?? "", opts.defaultDialCode);
      if (!n) { res.errors.push({ index, reason: "invalid phone number" }); return; }
      phone = n;
      res.ignoredExtraPhones += c.phones.length - 1;
    }
    const contact: VcfContact = { name, emails: c.emails.filter(e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) };
    if (phone) contact.phone = phone;
    if (c.org) contact.organization = c.org;
    if (c.title) contact.title = c.title;
    if (c.note) contact.note = c.note;
    res.contacts.push(contact);
  };

  for (const line of unfold(text)) {
    if (!line.trim()) continue;
    const upper = line.trim().toUpperCase();
    if (upper === "BEGIN:VCARD") {
      if (inCard) { res.errors.push({ index, reason: "unterminated card" }); card = null; }
      index++;
      if (index >= maxContacts) throw new RangeError("too many contacts in file");
      inCard = true;
      card = { phones: [], emails: [] };
      continue;
    }
    if (upper === "END:VCARD") { finish(); continue; }
    if (!inCard || !card) continue;

    const colon = line.indexOf(":");
    if (colon < 1) continue;
    const head = splitUnescaped(line.slice(0, colon));
    const nameRaw = (head[0] ?? "").toUpperCase();
    const name = nameRaw.includes(".") ? nameRaw.slice(nameRaw.indexOf(".") + 1) : nameRaw;
    const params = head.slice(1).join(";").toUpperCase();
    let value = line.slice(colon + 1);
    if (/ENCODING=QUOTED-PRINTABLE/.test(params)) {
      const cs = /CHARSET=([^;]+)/.exec(params)?.[1] ?? "UTF-8";
      value = decodeQp(value, cs);
    }
    switch (name) {
      case "FN": card.fn = unescapeValue(value).trim(); break;
      case "N": {
        const [family = "", given = ""] = splitUnescaped(value).map(unescapeValue);
        card.n = `${given} ${family}`.trim();
        break;
      }
      case "TEL": card.phones.push(unescapeValue(value).replace(/^tel:/i, "").trim()); break;
      case "EMAIL": card.emails.push(unescapeValue(value).trim()); break;
      case "ORG": card.org = unescapeValue(splitUnescaped(value)[0] ?? "").trim() || undefined; break;
      case "TITLE": card.title = unescapeValue(value).trim() || undefined; break;
      case "NOTE": card.note = unescapeValue(value); break;
    }
  }
  if (inCard) res.errors.push({ index, reason: "unterminated card" });
  return res;
}
