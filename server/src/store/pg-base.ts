import type { Db, Row } from "./db.ts";
import { DuplicateError } from "./types.ts";

/**
 * Shared plumbing for the PostgreSQL store.
 * Rules kept in every layer: values only through bound parameters (never string-built SQL from input),
 * user-owned rows always filtered by user_id, ledgers insert-only with ON CONFLICT on their idempotency key,
 * and every timestamp written comes from the injected clock (so tests can move time).
 */
export const ms = (col: string) => `(extract(epoch from ${col}) * 1000)::bigint`;
export const num = (v: unknown) => Number(v);
export const optMs = (v: unknown): number | undefined => (v === null || v === undefined ? undefined : Number(v));
export const isUnique = (e: unknown) => typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";
export const escapeLike = (s: string) => s.replace(/[\\%_]/g, c => `\\${c}`);
export const d = (t: number | undefined | null) => (t === undefined || t === null ? null : new Date(t));

export class PgBase {
  readonly db: Db;
  readonly now: () => number;
  constructor(db: Db, now: () => number = Date.now) { this.db = db; this.now = now; }

  /** Runs `fn` with a store bound to one transaction. Inside a transaction already: same transaction. */
  tx<T>(fn: (s: this) => Promise<T>): Promise<T> {
    if (this.db.inTransaction) return fn(this);
    return this.db.transaction(q => fn(new (this.constructor as new (db: Db, now: () => number) => this)(q, this.now)));
  }
  /** Transaction-scoped mutex (pg_advisory_xact_lock): held until COMMIT/ROLLBACK. Works across app replicas. */
  async lock(key: string): Promise<void> {
    if (!this.db.inTransaction) throw new Error("lock() must be called inside tx()");
    await this.db.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [key]);
  }
  protected async uniqueOr<T>(fn: () => Promise<T>, msg: string): Promise<T> {
    try { return await fn(); } catch (e) { if (isUnique(e)) throw new DuplicateError(msg); throw e; }
  }
  protected async one(sql: string, params: unknown[] = []): Promise<Row | undefined> { return (await this.db.query(sql, params)).rows[0]; }
  protected async all(sql: string, params: unknown[] = []): Promise<Row[]> { return (await this.db.query(sql, params)).rows; }

  async ping(): Promise<boolean> { const r = await this.one("SELECT 1 AS ok"); return r?.["ok"] === 1; }
}
