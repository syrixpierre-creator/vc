import type { GoogleClient, TokenResponse } from "./app.ts";
import type { Jwks } from "../auth/oauth.ts";

export const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
export const JWKS_ENDPOINT = "https://www.googleapis.com/oauth2/v3/certs";
export const REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";

export class GoogleAuthError extends Error {
  constructor(message: string) { super(message); this.name = "GoogleAuthError"; }
}

type Fetch = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

/** Real Google calls over HTTPS with timeouts. `fetchImpl` is injectable so tests never touch the network. */
export function createGoogleClient(opts: { clientId: string; clientSecret: string; fetchImpl?: Fetch; now?: () => number; timeoutMs?: number }): GoogleClient {
  const f: Fetch = opts.fetchImpl ?? (fetch as unknown as Fetch);
  const now = opts.now ?? Date.now;
  const timeout = opts.timeoutMs ?? 8000;
  let cache: { jwks: Jwks; until: number } | null = null;

  return {
    async exchangeCode(code, codeVerifier, redirectUri) {
      const body = new URLSearchParams({ code, client_id: opts.clientId, client_secret: opts.clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code", code_verifier: codeVerifier });
      const r = await f(TOKEN_ENDPOINT, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: body.toString(), signal: AbortSignal.timeout(timeout) });
      if (!r.ok) throw new Error(`token endpoint returned ${r.status}`); // never include the response body: it may echo credentials
      const j = (await r.json()) as { id_token?: unknown; access_token?: unknown; refresh_token?: unknown; expires_in?: unknown; scope?: unknown };
      if (typeof j.id_token !== "string") throw new Error("no id_token in response");
      const out: TokenResponse = { idToken: j.id_token };
      if (typeof j.access_token === "string") out.accessToken = j.access_token;
      if (typeof j.refresh_token === "string") out.refreshToken = j.refresh_token;
      if (typeof j.expires_in === "number") out.expiresIn = j.expires_in;
      if (typeof j.scope === "string") out.scope = j.scope;
      return out;
    },
    async refreshAccessToken(refreshToken) {
      const body = new URLSearchParams({ client_id: opts.clientId, client_secret: opts.clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" });
      const r = await f(TOKEN_ENDPOINT, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: body.toString(), signal: AbortSignal.timeout(timeout) });
      if (r.status === 400 || r.status === 401) throw new GoogleAuthError("invalid_grant"); // revoked or expired authorization
      if (!r.ok) throw new Error(`token endpoint returned ${r.status}`);
      const j = (await r.json()) as { access_token?: unknown; expires_in?: unknown };
      if (typeof j.access_token !== "string") throw new Error("no access_token in response");
      return { accessToken: j.access_token, expiresIn: typeof j.expires_in === "number" ? j.expires_in : 3600 };
    },
    async revokeToken(token) {
      try { await f(REVOKE_ENDPOINT, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token }).toString(), signal: AbortSignal.timeout(timeout) }); }
      catch { /* best effort: local disconnect never depends on Google being reachable */ }
    },
    async getJwks() {
      if (cache && cache.until > now()) return cache.jwks;
      const r = await f(JWKS_ENDPOINT, { signal: AbortSignal.timeout(timeout) });
      if (!r.ok) throw new Error(`jwks endpoint returned ${r.status}`);
      const j = (await r.json()) as Jwks;
      if (!Array.isArray(j.keys) || !j.keys.length) throw new Error("empty jwks");
      cache = { jwks: j, until: now() + 3600_000 };
      return j;
    },
  };
}
