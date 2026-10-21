import { test } from "node:test";
import assert from "node:assert/strict";
import { earnedCents, canRequestWithdrawal, referralsForWithdrawal, formatUsd, DEFAULT_POLICY } from "../src/domain/money.ts";
import { computeBalances, canReserve, type LedgerEntry } from "../src/domain/ledger.ts";
import { assertTransition, canTransition } from "../src/domain/payout.ts";
import { normalizeE164, maskPhone, maskEmail } from "../src/domain/phone.ts";
import { generateVcf, parseVcf, type VcfContact } from "../src/domain/vcf.ts";
import { loadConfig, ConfigError } from "../src/config/env.ts";
import { encrypt, decrypt, type KeyRing } from "../src/security/crypto.ts";

/* ---------- money ---------- */
test("reward curve: $5 at 500, $10 at 1000, linear up to 1,000,000", () => {
  assert.equal(earnedCents(0), 0);
  assert.equal(earnedCents(500), 500);
  assert.equal(earnedCents(1000), 1000);
  assert.equal(earnedCents(1500), 1500);
  assert.equal(earnedCents(1_000_000), 1_000_000);
  assert.equal(earnedCents(5_000_000), 1_000_000, "capped at maxRewardedReferrals");
});
test("withdrawal minimum is $15, reached at 1500 referrals", () => {
  assert.equal(referralsForWithdrawal(), 1500);
  assert.equal(canRequestWithdrawal(earnedCents(1499)), false);
  assert.equal(canRequestWithdrawal(earnedCents(1500)), true);
  assert.equal(DEFAULT_POLICY.minWithdrawCents, 1500);
});
test("money rejects non-integers", () => {
  assert.throws(() => earnedCents(1.5));
  assert.throws(() => earnedCents(-1));
  assert.throws(() => formatUsd(10.5));
  assert.equal(formatUsd(1_000_000), "$10,000.00");
  assert.equal(formatUsd(5), "$0.05");
});

/* ---------- ledger ---------- */
const E = (id: string, type: LedgerEntry["type"], amountCents: number, key = id): LedgerEntry => ({ id, type, amountCents, idempotencyKey: key });
test("ledger: earn, reserve, pay keeps categories distinct", () => {
  const b = computeBalances([E("1", "earn", 1500), E("2", "reserve", 1500), E("3", "pay", 1500)]);
  assert.deepEqual(b, { earned: 1500, available: 0, reserved: 0, paid: 1500 });
});
test("ledger: failed payout releases the reservation, never counts as paid", () => {
  const b = computeBalances([E("1", "earn", 1500), E("2", "reserve", 1500), E("3", "release", 1500)]);
  assert.deepEqual(b, { earned: 1500, available: 1500, reserved: 0, paid: 0 });
});
test("ledger: replayed idempotency key is ignored (no double earn)", () => {
  const b = computeBalances([E("1", "earn", 2, "referral:42"), E("2", "earn", 2, "referral:42")]);
  assert.equal(b.available, 2);
});
test("ledger: cannot reserve more than available or a non-positive amount", () => {
  const b = computeBalances([E("1", "earn", 1500)]);
  assert.equal(canReserve(b, 1500), true);
  assert.equal(canReserve(b, 1501), false);
  assert.equal(canReserve(b, 0), false);
  assert.throws(() => computeBalances([E("1", "earn", 100), E("2", "reserve", 200)]), /negative/);
});

/* ---------- payout state machine ---------- */
test("payout: paid needs confirmation and a transaction reference", () => {
  assert.throws(() => assertTransition({ from: "in_progress", to: "paid" }), /confirmation/);
  assert.throws(() => assertTransition({ from: "in_progress", to: "paid", confirmedPaid: true }), /reference/);
  assert.doesNotThrow(() => assertTransition({ from: "in_progress", to: "paid", confirmedPaid: true, txReference: "PP-8841" }));
});
test("payout: terminal and invalid transitions are refused", () => {
  assert.equal(canTransition("paid", "pending"), false);
  assert.equal(canTransition("pending", "paid"), false, "cannot skip review");
  assert.equal(canTransition("failed", "paid"), false);
  assert.throws(() => assertTransition({ from: "in_progress", to: "failed" }), /reason/);
});

/* ---------- phone ---------- */
test("phone: E.164 normalisation and masking", () => {
  assert.equal(normalizeE164("+33 6 12 34 56 78"), "+33612345678");
  assert.equal(normalizeE164("06 12 34 56 78", "+33"), "+33612345678");
  assert.equal(normalizeE164("0033612345678"), "+33612345678");
  assert.equal(normalizeE164("12345"), null);
  assert.equal(normalizeE164("0612345678"), null, "no dial code, no guess");
  assert.equal(maskPhone("+33612345678"), "+33 •• •• •• 78");
  assert.ok(!maskPhone("+33612345678").includes("6123456"));
  assert.equal(maskEmail("amina@gmail.com"), "a••••@gmail.com");
});

/* ---------- VCF ---------- */
const sample: VcfContact[] = [
  { name: "Amina Moreau", phone: "+33612345678", emails: ["amina@example.com"], organization: "Syrix; Co, Ltd", note: "Line 1\nLine 2, with; separators" },
  { name: "ليلى خان", phone: "+971501234567", emails: [] },
  { name: "João Silva", phone: "+5511912345678", emails: [], title: "Engenheiro" },
];
for (const v of ["2.1", "3.0", "4.0"] as const) {
  test(`VCF ${v}: round-trip keeps names, numbers and special characters`, () => {
    const out = parseVcf(generateVcf(sample, v));
    assert.equal(out.errors.length, 0);
    assert.equal(out.contacts.length, 3);
    assert.equal(out.contacts[0]!.name, "Amina Moreau");
    assert.equal(out.contacts[0]!.phone, "+33612345678");
    assert.equal(out.contacts[0]!.organization, "Syrix; Co, Ltd");
    assert.equal(out.contacts[0]!.note, "Line 1\nLine 2, with; separators");
    assert.equal(out.contacts[1]!.name, "ليلى خان");
    assert.equal(out.contacts[2]!.name, "João Silva");
  });
}
test("VCF: long lines are folded at 75 octets", () => {
  const long: VcfContact = { name: "Test", phone: "+33612345678", emails: [], note: "é".repeat(200) };
  const text = generateVcf([long], "3.0");
  for (const line of text.split("\r\n")) assert.ok(new TextEncoder().encode(line).length <= 75, "line too long");
  assert.equal(parseVcf(text).contacts[0]!.note, "é".repeat(200));
});
test("VCF: invalid records are reported, not imported", () => {
  const text = "BEGIN:VCARD\r\nVERSION:3.0\r\nTEL:+33612345678\r\nEND:VCARD\r\n" +
    "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Bad Phone\r\nTEL:123\r\nEND:VCARD\r\n" +
    "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Good\r\nTEL:+33612345678\r\nEND:VCARD\r\n" +
    "BEGIN:VCARD\r\nFN:Never closed\r\n";
  const r = parseVcf(text);
  assert.equal(r.contacts.length, 1);
  assert.deepEqual(r.errors.map(e => e.reason), ["missing name", "invalid phone number", "unterminated card"]);
});
test("VCF: only the first phone is kept (one number per contact)", () => {
  const r = parseVcf("BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Two Phones\r\nTEL:+33612345678\r\nTEL:+33698765432\r\nEND:VCARD\r\n");
  assert.equal(r.contacts[0]!.phone, "+33612345678");
  assert.equal(r.ignoredExtraPhones, 1);
});
test("VCF: hostile input cannot inject fields and size limits apply", () => {
  const evil: VcfContact = { name: "Eve\r\nTEL:+10000000000", phone: "+33612345678", emails: [], note: "x\r\nEND:VCARD\r\nBEGIN:VCARD" };
  const r = parseVcf(generateVcf([evil], "3.0"));
  assert.equal(r.contacts.length, 1);
  assert.equal(r.contacts[0]!.phone, "+33612345678");
  assert.throws(() => parseVcf("x".repeat(100), { maxBytes: 50 }), /too large/);
});
test("VCF 2.1: quoted-printable with soft line breaks decodes as UTF-8", () => {
  const t = "BEGIN:VCARD\r\nVERSION:2.1\r\nFN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:Jo=C3=A3o =\r\nSilva\r\nTEL;CELL:+5511912345678\r\nEND:VCARD\r\n";
  assert.equal(parseVcf(t).contacts[0]!.name, "João Silva");
});

/* ---------- config ---------- */
const good = {
  NODE_ENV: "production", APP_URL: "https://vcf.example.com", DATABASE_URL: "postgres://u:p@db:5432/vcf",
  REDIS_URL: "redis://redis:6379", SESSION_SECRET: "s".repeat(40), ENCRYPTION_KEY: "ab".repeat(32),
  ADMIN_EMAIL: "SyrixCompany@gmail.com", GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "secret",
  GOOGLE_REDIRECT_URI: "https://vcf.example.com/api/auth/google/callback",
};
test("config: valid environment loads and admin email is normalised", () => {
  assert.equal(loadConfig(good).adminEmail, "syrixcompany@gmail.com");
});
test("config: problems are listed without leaking secret values", () => {
  try {
    loadConfig({ ...good, SESSION_SECRET: "short-secret-value", ENCRYPTION_KEY: "nothex", APP_URL: "http://x.com", GOOGLE_CLIENT_ID: "" });
    assert.fail("should throw");
  } catch (e) {
    assert.ok(e instanceof ConfigError);
    const msg = (e as Error).message;
    assert.match(msg, /SESSION_SECRET/);
    assert.match(msg, /ENCRYPTION_KEY/);
    assert.match(msg, /APP_URL must use https/);
    assert.match(msg, /GOOGLE_CLIENT_ID is required/);
    assert.ok(!msg.includes("short-secret-value") && !msg.includes("nothex"));
  }
});

test("config: ads are off by default and need a client id to be switched on", () => {
  assert.deepEqual(loadConfig(good).ads, { enabled: false });
  assert.throws(() => loadConfig({ ...good, ADS_ENABLED: "true" }), /ADS_CLIENT_ID is required/);
  assert.deepEqual(loadConfig({ ...good, ADS_ENABLED: "true", ADS_CLIENT_ID: "ca-pub-123" }).ads, { enabled: true, clientId: "ca-pub-123" });
});

/* ---------- crypto ---------- */
const ring: KeyRing = { current: 2, keys: { 1: "11".repeat(32), 2: "22".repeat(32) } };
test("crypto: round trip, rotation and tamper / context binding", () => {
  const c = encrypt("amina@paypal.example", ring, "payout_method:7");
  assert.ok(c.startsWith("v2:") && !c.includes("paypal"));
  assert.equal(decrypt(c, ring, "payout_method:7"), "amina@paypal.example");
  assert.throws(() => decrypt(c, ring, "payout_method:8"), "context swap must fail");
  const parts = c.split(":"); parts[3] = Buffer.from("tampered").toString("base64url");
  assert.throws(() => decrypt(parts.join(":"), ring, "payout_method:7"));
  const old = encrypt("old", { current: 1, keys: ring.keys }, "ctx");
  assert.equal(decrypt(old, ring, "ctx"), "old", "old key version still readable");
});
