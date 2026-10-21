import pg from "pg";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export interface Queryable { query(text: string, params?: unknown[]): Promise<{ rows: Row[]; rowCount: number }> }
/**
 * A pool or one connection inside a transaction. `transaction` on a connection that is already
 * inside a transaction just runs the callback on it, so store methods compose without nesting BEGINs.
 */
export interface Db extends Queryable { readonly inTransaction: boolean; transaction<T>(fn: (q: Db) => Promise<T>): Promise<T>; close(): Promise<void> }

// bigint (sums, counts) arrives as a string by default; every amount we handle fits in a JS safe integer
pg.types.setTypeParser(20, v => Number(v));

export function createPgDb(connectionString: string, opts: { max?: number; statementTimeoutMs?: number } = {}): Db {
  const pool = new pg.Pool({ connectionString, max: opts.max ?? 10, statement_timeout: opts.statementTimeoutMs ?? 15_000, connectionTimeoutMillis: 5_000, idleTimeoutMillis: 30_000 });
  pool.on("error", () => undefined); // an idle client dying (e.g. database restart) must not crash the process; the next query reconnects
  const run = async (c: { query: pg.Pool["query"] }, t: string, p?: unknown[]) => { const r = await c.query(t, p as unknown[]); return { rows: r.rows as Row[], rowCount: r.rowCount ?? 0 }; };
  const inTx = (client: pg.PoolClient): Db => {
    const self: Db = {
      inTransaction: true,
      query: (t, p) => run(client as never, t, p),
      transaction: fn => fn(self),
      close: async () => undefined,
    };
    return self;
  };
  return {
    inTransaction: false,
    query: (t, p) => run(pool as never, t, p),
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const out = await fn(inTx(client));
        await client.query("COMMIT");
        return out;
      } catch (e) { await client.query("ROLLBACK").catch(() => undefined); throw e; }
      finally { client.release(); }
    },
    async close() { await pool.end(); },
  };
}
