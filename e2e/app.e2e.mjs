// End-to-end tests in a real browser: real PostgreSQL, the real server, the local stand-in for Google's sign-in page.
//   cd server && npm install            (Playwright comes with the dev dependencies)
//   DATABASE_ADMIN_URL=postgres://postgres@127.0.0.1:5432/postgres node --test ../e2e/app.e2e.mjs
// Optional: E2E_CHROMIUM=/path/to/chrome when Playwright's own browser is not installed.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile, writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(ROOT, "server", "package.json"));
const { chromium } = require("playwright");
const pg = require("pg");

const PORT = 3190, BASE = `http://localhost:${PORT}`;
const ADMIN_URL = process.env.DATABASE_ADMIN_URL ?? "postgres://postgres@127.0.0.1:5432/postgres";
const DB = "syrix_e2e";
const ADMIN_EMAIL = "e2e-admin@example.com";
let server, browser, logs = "";
const pageErrors = [];

before(async () => {
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${DB} WITH (FORCE)`);
  await admin.query(`CREATE DATABASE ${DB}`);
  await admin.end();
  const dbUrl = ADMIN_URL.replace(/\/[^/?]+(\?|$)/, `/${DB}$1`);
  server = spawn(process.execPath, ["src/dev.ts"], { cwd: join(ROOT, "server"), env: { ...process.env, PORT: String(PORT), DATABASE_URL: dbUrl, ADMIN_EMAIL } });
  server.stdout.on("data", d => { logs += d; }); server.stderr.on("data", d => { logs += d; });
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${BASE}/healthz`)).ok) break; } catch { /* starting */ }
    await new Promise(r => setTimeout(r, 200));
    if (i === 99) throw new Error(`server did not start:\n${logs}`);
  }
  browser = await chromium.launch(process.env.E2E_CHROMIUM ? { executablePath: process.env.E2E_CHROMIUM } : {});
});
after(async () => { await browser?.close(); server?.kill(); });

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, acceptDownloads: true, ...opts });
  const page = await ctx.newPage();
  page.setDefaultTimeout(10_000);
  page.on("pageerror", e => pageErrors.push(e.message));
  page.on("console", m => { if (m.type() === "error" && !/status of 4\d\d/.test(m.text())) pageErrors.push(m.text()); });
  return page;
}
/** Signs in through the stand-in Google page and finishes onboarding through the UI. */
async function signIn(page, email, { ref, finishOnboarding = true } = {}) {
  if (ref) await page.goto(`${BASE}/register?ref=${ref}`);
  await page.goto(`${BASE}/api/auth/google/start?next=%2Fapp%2F`);
  await page.fill("input[name=email]", email);
  await page.fill("input[name=name]", email.split("@")[0].replace(/\W/g, " "));
  await page.click("form button");
  await page.waitForURL(/\/app\//);
  if (!finishOnboarding) return;
  await page.waitForSelector(".onb-steps, .page-head");
  for (let i = 0; i < 10 && page.url().includes("onboarding"); i++) {
    for (const cb of await page.locator("label.check input[type=checkbox]:not(:checked)").all()) await cb.check();
    const next = page.locator("button.btn-primary, a.btn-primary").last();
    if ((await next.textContent()).includes("Connect Google Contacts")) { await page.goto(`${BASE}/app/#/overview`); break; } // last step: skip Google, onboarding is already saved
    await next.click();
    await page.waitForTimeout(300);
  }
  await page.waitForURL(/#\/overview/);
  await page.getByRole("heading", { level: 1 }).first().waitFor();
}
const toast = page => page.locator(".toast").last();
const api = (page, path, init = {}) => page.evaluate(async ([p, i]) => { const me = await (await fetch("/api/me")).json(); const r = await fetch(p, { ...i, headers: { "content-type": "application/json", "x-csrf-token": me.csrfToken, ...(i.headers ?? {}) } }); return { status: r.status, body: await r.json().catch(() => null) }; }, [path, init]);

test("public site: home, languages with Arabic right-to-left, legal pages, 404, no console errors", async () => {
  const page = await newPage();
  await page.goto(`${BASE}/?nointro`);
  await assert.doesNotReject(page.getByRole("link", { name: "Sign in with Google" }).first().waitFor());
  await page.selectOption("#langSel", "ar");
  await page.waitForFunction(() => document.documentElement.dir === "rtl");
  assert.equal(await page.textContent("[data-i18n='site.hero.cta']"), "تسجيل الدخول عبر Google");
  await page.goto(`${BASE}/legal/privacy?lang=fr`);
  await page.locator("article[data-doc-lang=fr]").waitFor(); // shown once the language is loaded
  assert.ok(await page.locator("article[data-doc-lang=en]").isHidden());
  await page.goto(`${BASE}/legal/terms?lang=pt`);
  await page.locator("#langNote").waitFor();
  assert.ok(await page.locator("article[data-doc-lang=en]").isVisible(), "falls back to English, and says so");
  const r = await page.goto(`${BASE}/does-not-exist?lang=en`);
  assert.equal(r.status(), 404);
  await page.getByRole("heading", { name: "Page not found" }).waitFor();
  await page.goto(`${BASE}/signin-error?e=suspended&lang=en`);
  await page.locator("#signinMsg", { hasText: "suspended" }).waitFor();
  await page.context().close();
});

let aliceCode = "";
test("sign-up and onboarding; contacts: add with two numbers, duplicate refused, search, edit, delete", async () => {
  const page = await newPage();
  await signIn(page, "alice@example.com");
  await page.goto(`${BASE}/app/#/contacts`);
  await page.getByRole("button", { name: "Add contact" }).first().click();
  await page.locator("dialog").getByLabel("Name", { exact: true }).fill("Amina Moreau");
  await page.getByLabel("Phone number").first().fill("+33 6 12 34 56 78");
  await page.getByRole("button", { name: "Add a number" }).click();
  await page.getByLabel("Phone number").nth(1).fill("+1 415 555 0100");
  await page.getByLabel("E-mails").fill("amina@example.com");
  await page.getByRole("button", { name: "Save" }).click();
  await assert.doesNotReject(page.getByText("Contact added").waitFor());
  await assert.doesNotReject(page.getByRole("cell", { name: /\+33612345678/ }).waitFor());

  await page.getByRole("button", { name: "Add contact" }).first().click();
  await page.locator("dialog").getByLabel("Name", { exact: true }).fill("Someone Else");
  await page.getByLabel("Phone number").first().fill("06 12 34 56 78".replace(/^0/, "+33 "));
  await page.getByRole("button", { name: "Save" }).click();
  await assert.doesNotReject(page.locator("dialog .error-text", { hasText: "Another contact already has this number." }).waitFor(), "duplicate refused with a clear message");
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByPlaceholder("Search name, number, e-mail, company…").fill("amina");
  await page.waitForTimeout(500);
  assert.equal(await page.locator("tbody tr").count(), 1);
  await page.getByRole("button", { name: "Amina Moreau" }).click();
  await page.locator("dialog").getByLabel("Company", { exact: true }).fill("Syrix Partners");
  await page.getByRole("button", { name: "Save" }).click();
  await assert.doesNotReject(page.getByText("Contact saved").waitFor());
  await assert.doesNotReject(page.getByText("Syrix Partners").first().waitFor());

  const me = await api(page, "/api/referrals/me");
  aliceCode = me.body.code;
  assert.match(aliceCode, /^[A-Z0-9]{8,12}$/);
  await page.context().close();
});

test("VCF import with preview (duplicates and invalid cards listed), export, backup", async () => {
  const page = await newPage();
  await signIn(page, "alice@example.com", { finishOnboarding: false });
  await page.goto(`${BASE}/app/#/contacts`);
  const dir = await mkdtemp(join(tmpdir(), "syrix-e2e-"));
  const file = join(dir, "contacts.vcf");
  await writeFile(file, [
    "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Lucas Ferreira\r\nTEL:+351 912 345 678\r\nEND:VCARD",
    "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Amina Moreau\r\nTEL:+33 6 12 34 56 78\r\nEND:VCARD",
    "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Broken Number\r\nTEL:12\r\nEND:VCARD",
  ].join("\r\n") + "\r\n");
  await page.getByRole("button", { name: "Import" }).first().click();
  await page.setInputFiles("dialog input[type=file]", file);
  await assert.doesNotReject(page.getByText("3 cards in the file").waitFor());
  const stat = label => page.locator("dialog .stat-row", { hasText: label }).locator("b");
  assert.equal(await stat("New contacts").textContent(), "1");
  assert.equal(await stat("Already in your contacts").textContent(), "1");
  assert.equal(await stat("Invalid cards").textContent(), "1");
  await page.getByRole("button", { name: "Import 1 contact" }).click();
  await assert.doesNotReject(page.getByText("Import finished").waitFor());
  await page.keyboard.press("Escape");

  const res = await page.request.get(`${BASE}/api/contacts/export?version=4.0`);
  const vcf = await res.text();
  assert.match(vcf, /FN:Lucas Ferreira/);
  assert.match(vcf, /FN:Amina Moreau/);
  assert.doesNotMatch(vcf, /Broken Number/);

  await page.goto(`${BASE}/app/#/backups`);
  await page.getByRole("button", { name: "Create backup" }).first().click();
  await page.getByLabel("Name (optional)").fill("e2e");
  await page.locator("dialog").getByRole("button", { name: "Create backup" }).click();
  await assert.doesNotReject(page.getByText("Backup created with 2 contacts").waitFor());
  await page.context().close();
});

test("referral link: the invited account appears for the referrer, pending (24-hour waiting period), never qualified by a click", async () => {
  assert.ok(aliceCode);
  const bob = await newPage();
  await signIn(bob, "bob@example.com", { ref: aliceCode });
  await bob.context().close();
  const alice = await newPage();
  await signIn(alice, "alice@example.com", { finishOnboarding: false });
  await alice.goto(`${BASE}/app/#/referrals`);
  const row = alice.locator("tbody tr", { hasText: "B." }); // referrers only see an initial
  await assert.doesNotReject(row.waitFor());
  assert.match(await row.textContent(), /Pending/);
  const kpi = alice.locator(".kpi").filter({ has: alice.getByText("Qualified", { exact: true }) }).locator(".k-value");
  assert.equal((await kpi.textContent()).trim(), "0");
  await alice.context().close();
});

test("wallet: payout method saved masked; secrets refused; withdrawal blocked below the minimum", async () => {
  const page = await newPage();
  await signIn(page, "alice@example.com", { finishOnboarding: false });
  await page.goto(`${BASE}/app/#/wallet`);
  assert.ok(await page.getByRole("button", { name: "Withdraw" }).isDisabled(), "nothing to withdraw");
  await page.getByRole("button", { name: "Add payout method" }).click();
  const dlg = page.locator("dialog");
  await dlg.locator("#pmDetails").fill("abandon ability able about above absent absorb abstract absurd abuse access accident");
  await dlg.getByLabel("Account holder name").fill("Alice Example");
  await dlg.getByRole("button", { name: "Save" }).click();
  await assert.doesNotReject(dlg.locator(".error-text").filter({ hasText: /not valid|password|private key/ }).waitFor(), "a recovery-phrase-like value is refused");
  await dlg.locator("#pmDetails").fill("alice.paypal@example.com");
  await dlg.getByRole("button", { name: "Save" }).click();
  await assert.doesNotReject(page.getByText("Payout method saved").waitFor());
  const listed = await page.locator(".card", { hasText: "Payout methods" }).textContent();
  assert.doesNotMatch(listed, /alice\.paypal@example\.com/, "the full address is never shown back");
  await page.context().close();
});

test("support: a ticket reaches the team, the reply reaches the user; internal notes stay internal", async () => {
  const user = await newPage();
  await signIn(user, "alice@example.com", { finishOnboarding: false });
  await user.goto(`${BASE}/app/#/support`);
  await user.getByRole("button", { name: "New ticket" }).first().click();
  await user.getByLabel("Subject").fill("Import question");
  await user.getByLabel("Message").fill("How do I import a VCF file from my old phone?");
  await user.locator("dialog").getByRole("button", { name: "Send" }).click();
  await assert.doesNotReject(user.getByText("Ticket sent").waitFor());

  const admin = await newPage();
  await signIn(admin, ADMIN_EMAIL);
  await admin.goto(`${BASE}/admin/#/support`);
  await admin.getByRole("link", { name: "Import question" }).click();
  await admin.locator("textarea").first().fill("Export a .vcf from the phone, then use Contacts → Import.");
  await admin.getByRole("button", { name: "Send" }).click();
  await admin.waitForTimeout(500);
  await admin.locator("label.switch", { hasText: "Internal note" }).click();
  await admin.locator("textarea").first().fill("internal: user seems new");
  await admin.getByRole("button", { name: "Add note" }).click();
  await admin.waitForTimeout(500);

  await user.goto(`${BASE}/app/#/support`);
  await user.getByRole("link", { name: "Import question" }).click();
  await assert.doesNotReject(user.getByText("Export a .vcf from the phone").waitFor());
  assert.equal(await user.getByText("internal: user seems new").count(), 0, "internal note never shown to the user");
  await user.context().close(); await admin.context().close();
});

test("admin: a normal account cannot use the console; the admin sees the overview, users without contact contents, and the audit log", async () => {
  const user = await newPage();
  await signIn(user, "alice@example.com", { finishOnboarding: false });
  await user.goto(`${BASE}/admin/`);
  await assert.doesNotReject(user.getByRole("heading", { name: "No admin access" }).waitFor());
  assert.equal((await api(user, "/api/admin/overview")).status, 403);
  await user.context().close();

  const admin = await newPage();
  await signIn(admin, ADMIN_EMAIL, { finishOnboarding: false });
  await admin.goto(`${BASE}/admin/#/overview`);
  await assert.doesNotReject(admin.getByRole("heading", { name: "Overview" }).waitFor());
  await admin.goto(`${BASE}/admin/#/users`);
  await admin.getByRole("link", { name: /alice/ }).first().click();
  await admin.getByRole("tab", { name: "Contacts" }).click();
  await assert.doesNotReject(admin.getByText("Admins see counts and sync status only").waitFor());
  assert.equal(await admin.getByText("Amina Moreau").count(), 0, "contact names are never shown to admins");
  await admin.getByRole("button", { name: "Actions" }).click();
  await admin.getByRole("menuitem", { name: "Set review status" }).click();
  await admin.locator("dialog select").selectOption("flagged");
  await admin.locator("#cf-reason").fill("e2e check");
  await admin.locator("dialog").getByRole("button", { name: "Save" }).click();
  await admin.waitForTimeout(400);
  await admin.goto(`${BASE}/admin/#/audit`);
  await assert.doesNotReject(admin.getByText("user.review").first().waitFor());
  await assert.doesNotReject(admin.getByText("e2e check").first().waitFor());
  await admin.context().close();
});

test("account: data export, sign out other devices, deletion scheduled and cancelled", async () => {
  const other = await newPage();
  await signIn(other, "alice@example.com", { finishOnboarding: false });
  const page = await newPage();
  await signIn(page, "alice@example.com", { finishOnboarding: false });
  const exp = await page.request.get(`${BASE}/api/me/export`);
  const data = JSON.parse(await exp.text());
  assert.ok(data.contacts.some(c => c.fullName === "Amina Moreau"), "export contains the user's contacts");
  await page.goto(`${BASE}/app/#/settings`);
  await page.getByRole("tab", { name: "Security" }).click();
  await page.getByRole("button", { name: "Sign out all other devices" }).click();
  await assert.doesNotReject(page.getByText(/device signed out|devices signed out/).first().waitFor());
  assert.equal((await other.request.get(`${BASE}/api/me`)).status(), 401, "the other device is signed out");

  await page.getByRole("tab", { name: "Your data" }).click();
  await page.getByRole("button", { name: "Delete my account" }).click();
  await page.locator("dialog input").fill("DELETE");
  await page.locator("dialog").getByRole("button", { name: "Delete my account" }).click();
  await assert.doesNotReject(page.getByRole("alert").getByRole("button", { name: "Keep my account" }).waitFor());
  await page.getByRole("alert").getByRole("button", { name: "Keep my account" }).click();
  await assert.doesNotReject(page.getByText("Deletion cancelled").waitFor());
  await page.context().close(); await other.context().close();
});

test("mobile: bottom navigation and the More drawer work at phone width", async () => {
  const page = await newPage({ viewport: { width: 390, height: 844 } });
  await signIn(page, "alice@example.com", { finishOnboarding: false });
  await page.goto(`${BASE}/app/#/overview`);
  await page.locator(".tabbar").getByRole("link", { name: "Contacts" }).click();
  await assert.doesNotReject(page.getByRole("heading", { name: "Contacts", level: 1 }).waitFor());
  await page.locator(".tabbar").getByRole("button", { name: "More" }).click();
  await page.locator("#side").getByRole("link", { name: "Settings" }).click();
  await assert.doesNotReject(page.getByRole("heading", { name: "Settings", level: 1 }).waitFor());
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(overflow <= 1, `no horizontal scrolling (${overflow}px)`);
  await page.context().close();
});

test("no uncaught errors in any page", () => {
  assert.deepEqual(pageErrors, []);
});
