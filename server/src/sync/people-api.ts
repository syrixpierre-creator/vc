import { PeopleApiError, type PeopleApi, type SyncContact } from "./engine.ts";

const BASE = "https://people.googleapis.com/v1";
type Fetch = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string; signal?: AbortSignal }) =>
  Promise<{ ok: boolean; status: number; headers: { get(n: string): string | null }; json(): Promise<unknown> }>;

function personBody(c: SyncContact): Record<string, unknown> {
  const words = c.fullName.trim().split(/\s+/);
  const family = words.length > 1 ? words[words.length - 1] : undefined;
  const given = words.length > 1 ? words.slice(0, -1).join(" ") : words[0];
  const body: Record<string, unknown> = { names: [{ givenName: given, ...(family ? { familyName: family } : {}) }] };
  if (c.phone) body["phoneNumbers"] = [{ value: c.phone, type: "mobile" }];
  if (c.emails.length) body["emailAddresses"] = c.emails.map(value => ({ value }));
  if (c.organization || c.title) body["organizations"] = [{ ...(c.organization ? { name: c.organization } : {}), ...(c.title ? { title: c.title } : {}) }];
  if (c.notes) body["biographies"] = [{ value: c.notes, contentType: "TEXT_PLAIN" }];
  return body;
}

/** Maps an HTTP failure to the sync engine's error kinds. Response bodies are never copied into messages. */
function toError(status: number, retryAfter: string | null): PeopleApiError {
  if (status === 401) return new PeopleApiError("auth_revoked", "401");
  if (status === 403) return new PeopleApiError("auth_revoked", "403"); // missing scope or access revoked: user must reconnect
  if (status === 429) { const s = Number(retryAfter); return new PeopleApiError("rate_limited", "429", Number.isFinite(s) && s > 0 ? Math.min(s, 3600) * 1000 : undefined); }
  if (status === 404 || status === 409 || status === 412) return new PeopleApiError("conflict", String(status)); // changed or removed on Google's side
  if (status >= 500) return new PeopleApiError("transient", String(status));
  return new PeopleApiError("invalid", String(status));
}

/** Official Google People API (v1). Creates and updates only: this adapter has no delete call on purpose. */
export function createPeopleApi(opts: { fetchImpl?: Fetch; timeoutMs?: number } = {}): PeopleApi {
  const f: Fetch = opts.fetchImpl ?? (fetch as unknown as Fetch);
  const timeout = opts.timeoutMs ?? 10_000;
  async function call(url: string, method: string, token: string, body: unknown): Promise<Record<string, unknown>> {
    let r;
    try {
      r = await f(url, { method, headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeout) });
    } catch { throw new PeopleApiError("transient", "network"); }
    if (!r.ok) throw toError(r.status, r.headers.get("retry-after"));
    return (await r.json()) as Record<string, unknown>;
  }
  return {
    async createContact(token, c) {
      const j = await call(`${BASE}/people:createContact?personFields=names,phoneNumbers,metadata`, "POST", token, personBody(c));
      if (typeof j["resourceName"] !== "string" || typeof j["etag"] !== "string") throw new PeopleApiError("transient", "bad_response");
      return { resourceName: j["resourceName"], etag: j["etag"] };
    },
    async updateContact(token, resourceName, etag, c) {
      if (!/^people\/c?\d+$/.test(resourceName)) throw new PeopleApiError("invalid", "bad_resource_name"); // no path tricks in the URL
      const fields = "names,phoneNumbers,emailAddresses,organizations,biographies";
      const j = await call(`${BASE}/${resourceName}:updateContact?updatePersonFields=${fields}&personFields=metadata`, "PATCH", token, { ...personBody(c), etag });
      if (typeof j["etag"] !== "string") throw new PeopleApiError("transient", "bad_response");
      return { etag: j["etag"] };
    },
  };
}
