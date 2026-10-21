/** Minimal database port. The real implementation wraps `pg`; tests use a recording fake. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export interface Queryable { query(text: string, params?: unknown[]): Promise<{ rows: Row[]; rowCount: number }> }
export interface Db extends Queryable { transaction<T>(fn: (q: Queryable) => Promise<T>): Promise<T>; close(): Promise<void> }

/** `pg` is loaded at runtime so the rest of the code type-checks and tests run without it installed. */
export async function createPgDb(connectionString: string, opts: { max?: number } = {}): Promise<Db> {
  const name = "pg";
  const mod = (await import(name)) as { default?: { Pool: new (o: unknown) => PgPool }; Pool?: new (o: unknown) => PgPool };
  const Pool = mod.Pool ?? mod.default?.Pool;
  if (!Pool) throw new Error("the 'pg' package is not installed: run `npm install` in server/");
  const pool = new Pool({ connectionString, max: opts.max ?? 10, statement_timeout: 15_000, connectionTimeoutMillis: 5_000 });
  const wrap = (c: PgClientLike): Queryable => ({ async query(t, p) { const r = await c.query(t, p); return { rows: r.rows, rowCount: r.rowCount ?? 0 }; } });
  return {
    ...wrap(pool),
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const out = await fn(wrap(client));
        await client.query("COMMIT");
        return out;
      } catch (e) { await client.query("ROLLBACK").catch(() => undefined); throw e; }
      finally { client.release(); }
    },
    async close() { await pool.end(); },
  };
}
interface PgClientLike { query(t: string, p?: unknown[]): Promise<{ rows: Row[]; rowCount: number | null }> }
interface PgPool extends PgClientLike { connect(): Promise<PgClientLike & { release(): void }>; end(): Promise<void> }
