import { test } from "node:test";
import assert from "node:assert/strict";
import { createGoogleClient, GoogleAuthError, TOKEN_ENDPOINT, JWKS_ENDPOINT, REVOKE_ENDPOINT } from "../src/http/google-client.ts";

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

test("exchangeCode posts the PKCE verifier and secret to Google's token endpoint over a form body", async () => {
  let seen: { url: string; body: string; method?: string } | null = null;
  const g = createGoogleClient({ clientId: "cid", clientSecret: "csecret", fetchImpl: async (url, init) => { seen = { url, body: init!.body!, method: init!.method }; return ok({ id_token: "T" }); } });
  assert.deepEqual(await g.exchangeCode("CODE", "VERIFIER", "https://x.example/cb"), { idToken: "T" });
  assert.equal(seen!.url, TOKEN_ENDPOINT);
  assert.equal(seen!.method, "POST");
  const p = new URLSearchParams(seen!.body);
  assert.deepEqual([p.get("grant_type"), p.get("code"), p.get("code_verifier"), p.get("client_id")], ["authorization_code", "CODE", "VERIFIER", "cid"]);
});
test("exchangeCode errors do not leak the response body or secrets", async () => {
  const g = createGoogleClient({ clientId: "cid", clientSecret: "csecret", fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({ error: "invalid_grant", secret: "csecret" }) }) });
  await assert.rejects(g.exchangeCode("c", "v", "r"), (e: Error) => e.message === "token endpoint returned 400" && !e.message.includes("csecret"));
  const g2 = createGoogleClient({ clientId: "cid", clientSecret: "s", fetchImpl: async () => ok({}) });
  await assert.rejects(g2.exchangeCode("c", "v", "r"), /no id_token/);
});
test("JWKS are cached for an hour, then refetched", async () => {
  let calls = 0, t = 0;
  const g = createGoogleClient({ clientId: "c", clientSecret: "s", now: () => t, fetchImpl: async url => { calls++; assert.equal(url, JWKS_ENDPOINT); return ok({ keys: [{ kid: "k", kty: "RSA" }] }); } });
  await g.getJwks(); await g.getJwks();
  assert.equal(calls, 1);
  t = 3600_001;
  await g.getJwks();
  assert.equal(calls, 2);
});

test("exchangeCode returns access and refresh tokens and the granted scope when Google sends them", async () => {
  const g = createGoogleClient({ clientId: "c", clientSecret: "s", fetchImpl: async () => ok({ id_token: "T", access_token: "A", refresh_token: "R", expires_in: 3599, scope: "openid email https://www.googleapis.com/auth/contacts" }) });
  assert.deepEqual(await g.exchangeCode("c", "v", "r"), { idToken: "T", accessToken: "A", refreshToken: "R", expiresIn: 3599, scope: "openid email https://www.googleapis.com/auth/contacts" });
});
test("refreshAccessToken uses the refresh_token grant; a 400/401 means the user revoked access", async () => {
  let body = "";
  const g = createGoogleClient({ clientId: "cid", clientSecret: "sec", fetchImpl: async (url, init) => { assert.equal(url, TOKEN_ENDPOINT); body = init!.body!; return ok({ access_token: "NEW", expires_in: 1800 }); } });
  assert.deepEqual(await g.refreshAccessToken("RT"), { accessToken: "NEW", expiresIn: 1800 });
  const p = new URLSearchParams(body);
  assert.deepEqual([p.get("grant_type"), p.get("refresh_token")], ["refresh_token", "RT"]);
  const revoked = createGoogleClient({ clientId: "c", clientSecret: "s", fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({ error: "invalid_grant" }) }) });
  await assert.rejects(revoked.refreshAccessToken("RT"), (e: unknown) => e instanceof GoogleAuthError);
  const down = createGoogleClient({ clientId: "c", clientSecret: "s", fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({}) }) });
  await assert.rejects(down.refreshAccessToken("RT"), (e: unknown) => !(e instanceof GoogleAuthError), "an outage is not a revocation");
});
test("revokeToken posts to Google's revoke endpoint and never throws, even if Google is unreachable", async () => {
  let seen = "";
  await createGoogleClient({ clientId: "c", clientSecret: "s", fetchImpl: async (url, init) => { seen = `${url}|${init!.body}`; return ok({}); } }).revokeToken("TOK");
  assert.equal(seen, `${REVOKE_ENDPOINT}|token=TOK`);
  await assert.doesNotReject(createGoogleClient({ clientId: "c", clientSecret: "s", fetchImpl: async () => { throw new Error("offline"); } }).revokeToken("TOK"));
});
