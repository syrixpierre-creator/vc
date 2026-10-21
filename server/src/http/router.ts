import type { Permission } from "../auth/rbac.ts";
import type { Ctx } from "./kit.ts";

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
/**
 * Access level, enforced by the app before the handler runs:
 *  public  - anyone
 *  user    - signed-in, read-only request
 *  write   - signed-in + same-origin + CSRF token (every state change)
 *  { perm } - signed-in with an admin permission; state changes also need CSRF
 */
export type Access = "public" | "user" | "write" | { perm: Permission };
export interface RouteMeta { summary: string; tag: string; access: Access; limit?: string; body?: string; query?: string; produces?: string; allowWhenRestricted?: boolean }
export interface Route extends RouteMeta { method: Method; path: string; re: RegExp; keys: string[]; handler: (c: Ctx) => Promise<void> }

const PARAM = { id: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", key: "[\\w-]{1,64}", kind: "[a-z_]{1,32}" } as const;

export class Router {
  readonly routes: Route[] = [];
  add(method: Method, path: string, meta: RouteMeta, handler: (c: Ctx) => Promise<void>) {
    const keys: string[] = [];
    const src = path.replace(/:(\w+)/g, (_, k: string) => { keys.push(k); return `(${(PARAM as Record<string, string>)[k.replace(/\d+$/, "")] ?? PARAM.id})`; });
    this.routes.push({ ...meta, method, path, re: new RegExp(`^${src}$`), keys, handler });
  }
  get(p: string, m: RouteMeta, h: (c: Ctx) => Promise<void>) { this.add("GET", p, m, h); }
  post(p: string, m: RouteMeta, h: (c: Ctx) => Promise<void>) { this.add("POST", p, m, h); }
  put(p: string, m: RouteMeta, h: (c: Ctx) => Promise<void>) { this.add("PUT", p, m, h); }
  patch(p: string, m: RouteMeta, h: (c: Ctx) => Promise<void>) { this.add("PATCH", p, m, h); }
  delete(p: string, m: RouteMeta, h: (c: Ctx) => Promise<void>) { this.add("DELETE", p, m, h); }

  /** Returns the route and its params, `"method"` when the path exists with another method, or null. */
  match(method: string, path: string): { route: Route; params: Record<string, string> } | "method" | null {
    let pathSeen = false;
    for (const r of this.routes) {
      const m = r.re.exec(path);
      if (!m) continue;
      pathSeen = true;
      if (r.method !== method) continue;
      const params: Record<string, string> = {};
      r.keys.forEach((k, i) => { params[k] = m[i + 1]!; });
      return { route: r, params };
    }
    return pathSeen ? "method" : null;
  }

  /** OpenAPI 3.1 document generated from the registered routes (the same table that enforces access). */
  openApi(info: { title: string; version: string; serverUrl: string }) {
    const paths: Record<string, Record<string, unknown>> = {};
    for (const r of this.routes) {
      const p = r.path.replace(/:(\w+)/g, "{$1}");
      const security = r.access === "public" ? [] : [{ session: [] }];
      const desc: string[] = [];
      if (typeof r.access === "object") desc.push(`Requires admin permission \`${r.access.perm}\`.`);
      if (r.access === "write" || (typeof r.access === "object" && r.method !== "GET")) desc.push("State change: needs the `x-csrf-token` header and a same-origin `Origin`.");
      if (r.limit) desc.push(`Rate limited (\`${r.limit}\`).`);
      if (r.body) desc.push(`Body: ${r.body}`);
      if (r.query) desc.push(`Query: ${r.query}`);
      (paths[p] ??= {})[r.method.toLowerCase()] = {
        tags: [r.tag], summary: r.summary, ...(desc.length ? { description: desc.join("\n\n") } : {}), security,
        parameters: r.keys.map(k => ({ name: k, in: "path", required: true, schema: { type: "string" } })),
        ...(r.method !== "GET" && r.method !== "DELETE" ? { requestBody: { required: false, content: { "application/json": { schema: { type: "object" } } } } } : {}),
        responses: { "200": { description: "OK", content: { [r.produces ?? "application/json"]: {} } }, "400": { description: "Validation error `{error}`" }, "401": { description: "Not signed in" },
          "403": { description: "Forbidden / bad CSRF / restricted" }, "404": { description: "Not found (also for other users' ids)" }, "409": { description: "Conflict" }, "429": { description: "Rate limited" } },
      };
    }
    return {
      openapi: "3.1.0", info: { title: info.title, version: info.version, description: "SYRIX VCF REST API. Every error is `{\"error\": \"<code>\"}`. Money is integer cents (USD)." },
      servers: [{ url: info.serverUrl }],
      components: { securitySchemes: { session: { type: "apiKey", in: "cookie", name: "__Host-sid" } } },
      paths,
    };
  }
}
