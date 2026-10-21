import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Queryable } from "./store/db.ts";

export interface MigrationFile { name: string; sql: string }

/** Applies every unapplied migration in filename order. Each file wraps itself in BEGIN/COMMIT and records its own version. */
export async function runMigrations(db: Queryable, files: readonly MigrationFile[], log: (m: string) => void = () => undefined): Promise<string[]> {
  for (const f of files) if (!/^\d{4}_[a-z0-9_]+\.sql$/.test(f.name)) throw new Error(`unexpected migration file name: ${f.name}`);
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
  const exists = await db.query("SELECT to_regclass('public.schema_migrations') AS t");
  const applied = new Set<string>();
  if (exists.rows[0]?.t) for (const r of (await db.query("SELECT version FROM schema_migrations")).rows) applied.add(r.version as string);
  const done: string[] = [];
  for (const f of sorted) {
    const version = f.name.replace(/\.sql$/, "");
    if (applied.has(version)) continue;
    log(`applying ${version}`);
    await db.query(f.sql); // a failure stops here: later migrations are never attempted on a half-migrated schema
    done.push(version);
  }
  return done;
}

export function readMigrations(dir: string): MigrationFile[] {
  return readdirSync(dir).filter(n => n.endsWith(".sql")).sort().map(name => ({ name, sql: readFileSync(join(dir, name), "utf8") }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { createPgDb } = await import("./store/db.ts");
  const url = process.env["DATABASE_URL"];
  if (!url) { console.error("DATABASE_URL is required"); process.exit(1); }
  const db = await createPgDb(url, { max: 1 });
  try {
    const done = await runMigrations(db, readMigrations(process.env["MIGRATIONS_DIR"] ?? "db/migrations"), m => console.log(m));
    console.log(done.length ? `applied: ${done.join(", ")}` : "database is up to date");
  } catch (e) { console.error("migration failed:", (e as Error).message); process.exitCode = 1; }
  finally { await db.close(); }
}
