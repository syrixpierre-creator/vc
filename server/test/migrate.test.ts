import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runMigrations, readMigrations } from "../src/migrate.ts";
import type { Queryable } from "../src/store/db.ts";

function fakeDb(applied: string[] | null, failOn?: string) {
  const ran: string[] = [];
  const q: Queryable = {
    async query(text) {
      if (text.includes("to_regclass")) return { rows: [{ t: applied ? "schema_migrations" : null }], rowCount: 1 };
      if (text.includes("FROM schema_migrations")) return { rows: (applied ?? []).map(version => ({ version })), rowCount: 0 };
      if (failOn && text.includes(failOn)) throw new Error("boom");
      ran.push(text.match(/VALUES \('([^']+)'\)/)?.[1] ?? text.slice(0, 20));
      return { rows: [], rowCount: 0 };
    },
  };
  return { q, ran };
}
const f = (n: string) => ({ name: `${n}.sql`, sql: `BEGIN; INSERT INTO schema_migrations (version) VALUES ('${n}'); COMMIT;` });

test("fresh database: all migrations run in filename order, even if given shuffled", async () => {
  const { q, ran } = fakeDb(null);
  const done = await runMigrations(q, [f("0002_b"), f("0001_a"), f("0003_c")]);
  assert.deepEqual(done, ["0001_a", "0002_b", "0003_c"]);
  assert.deepEqual(ran, done);
});
test("already applied migrations are skipped; re-running is a no-op", async () => {
  const { q } = fakeDb(["0001_a", "0002_b"]);
  assert.deepEqual(await runMigrations(q, [f("0001_a"), f("0002_b"), f("0003_c")]), ["0003_c"]);
  assert.deepEqual(await runMigrations(fakeDb(["0001_a", "0002_b", "0003_c"]).q, [f("0001_a"), f("0002_b"), f("0003_c")]), []);
});
test("a failing migration stops the run: later ones are never attempted", async () => {
  const { q, ran } = fakeDb(["0001_a"], "0002_b");
  await assert.rejects(runMigrations(q, [f("0001_a"), f("0002_b"), f("0003_c")]), /boom/);
  assert.deepEqual(ran, []);
});
test("unexpected file names are refused", async () => {
  await assert.rejects(runMigrations(fakeDb(null).q, [{ name: "evil; DROP.sql", sql: "" }]), /unexpected migration file name/);
  await assert.rejects(runMigrations(fakeDb(null).q, [{ name: "1_short.sql", sql: "" }]), /unexpected/);
});

test("the real migration files are well-formed: sequential, transactional, and each records its own version", () => {
  const files = readMigrations(new URL("../../db/migrations", import.meta.url).pathname);
  assert.ok(files.length >= 3);
  files.forEach((m, i) => {
    const stem = m.name.replace(/\.sql$/, "");
    assert.equal(m.name.slice(0, 4), String(i + 1).padStart(4, "0"), "no gaps in numbering");
    const body = m.sql.split("\n").filter(l => !l.trim().startsWith("--")).join("\n").trim();
    assert.match(body, /^BEGIN;/, `${m.name} must start a transaction`);
    assert.match(body, /COMMIT;$/, `${m.name} must commit`);
    assert.ok(body.includes(`INSERT INTO schema_migrations (version) VALUES ('${stem}')`), `${m.name} must record its version`);
  });
});
test("destructive statements never appear in migrations without an explicit review", () => {
  for (const m of readMigrations(new URL("../../db/migrations", import.meta.url).pathname)) {
    assert.ok(!/\bDROP\s+(TABLE|COLUMN|SCHEMA)\b|\bTRUNCATE\b|\bDELETE\s+FROM\b/i.test(m.sql), `${m.name} contains a destructive statement`);
  }
});
test("schema covers every table named in the specification", () => {
  const sql = readMigrations(new URL("../../db/migrations", import.meta.url).pathname).map(m => m.sql).join("\n");
  const required = ["users", "user_settings", "oauth_accounts", "sessions", "contacts", "contact_labels", "contact_sync_jobs", "contact_sync_logs", "contact_backups", "contact_change_history",
    "referral_codes", "referrals", "referral_events", "user_xp_ledger", "user_achievements", "vip_levels", "challenge_definitions", "challenge_participation", "challenge_progress",
    "challenge_reward_claims", "reward_definitions", "reward_claims", "reward_ledger", "payout_methods", "payout_requests", "payout_status_history", "reward_fulfillment", "notifications",
    "support_tickets", "announcements", "admin_roles", "admin_permissions", "admin_audit_logs", "security_events", "account_restrictions", "system_settings"];
  const missing = required.filter(t => !new RegExp(`CREATE TABLE ${t} \\(`).test(sql));
  assert.deepEqual(missing, []);
});
