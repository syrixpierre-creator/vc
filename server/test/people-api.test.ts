import { test } from "node:test";
import assert from "node:assert/strict";
import { createPeopleApi } from "../src/sync/people-api.ts";
import { PeopleApiError, type SyncContact } from "../src/sync/engine.ts";

const contact: SyncContact = { id: "c1", userId: "u1", fullName: "Amina Marie Moreau", phones: ["+33612345678"], emails: ["a@b.co"], organization: "Syrix", notes: "hello", version: 1 };
type Call = { url: string; init: { method?: string; headers?: Record<string, string>; body?: string } };
const res = (status: number, body: unknown = {}, headers: Record<string, string> = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: (n: string) => headers[n.toLowerCase()] ?? null }, json: async () => body });

test("create: official endpoint, bearer token in the header only, person fields mapped", async () => {
  const calls: Call[] = [];
  const api = createPeopleApi({ fetchImpl: async (url, init) => { calls.push({ url, init: init! }); return res(200, { resourceName: "people/c123", etag: "E1" }); } });
  assert.deepEqual(await api.createContact("TOKEN", contact), { resourceName: "people/c123", etag: "E1" });
  const c = calls[0]!;
  assert.match(c.url, /^https:\/\/people\.googleapis\.com\/v1\/people:createContact\?/);
  assert.ok(!c.url.includes("TOKEN"), "token never in the URL");
  assert.equal(c.init.headers!["authorization"], "Bearer TOKEN");
  const body = JSON.parse(c.init.body!);
  assert.deepEqual(body.names, [{ givenName: "Amina Marie", familyName: "Moreau" }]);
  assert.deepEqual(body.phoneNumbers, [{ value: "+33612345678", type: "mobile" }]);
  assert.deepEqual(body.emailAddresses, [{ value: "a@b.co" }]);
  assert.deepEqual(body.organizations, [{ name: "Syrix" }]);
  assert.equal(body.biographies[0].value, "hello");
});
test("update: PATCH with the etag, only the contact fields, on a validated resource name", async () => {
  const calls: Call[] = [];
  const api = createPeopleApi({ fetchImpl: async (url, init) => { calls.push({ url, init: init! }); return res(200, { etag: "E2" }); } });
  assert.deepEqual(await api.updateContact("T", "people/c123", "E1", contact), { etag: "E2" });
  assert.equal(calls[0]!.init.method, "PATCH");
  assert.match(calls[0]!.url, /\/v1\/people\/c123:updateContact\?updatePersonFields=/);
  assert.equal(JSON.parse(calls[0]!.init.body!).etag, "E1");
});
test("update refuses resource names that could alter the URL path", async () => {
  const api = createPeopleApi({ fetchImpl: async () => { throw new Error("must not be called"); } });
  for (const bad of ["people/../me", "people/c1/../../x", "people/c1?x=1", "contactGroups/c1", "https://evil.example"]) {
    await assert.rejects(api.updateContact("T", bad, "E", contact), (e: unknown) => e instanceof PeopleApiError && e.kind === "invalid", bad);
  }
});
test("HTTP errors map to the engine's kinds; Retry-After is honoured and capped at one hour", async () => {
  const kind = async (status: number, headers: Record<string, string> = {}) => {
    const api = createPeopleApi({ fetchImpl: async () => res(status, { error: "secret details" }, headers) });
    try { await api.createContact("T", contact); return null; } catch (e) { return e as PeopleApiError; }
  };
  assert.equal((await kind(401))!.kind, "auth_revoked");
  assert.equal((await kind(403))!.kind, "auth_revoked");
  assert.equal((await kind(400))!.kind, "invalid");
  assert.equal((await kind(409))!.kind, "conflict");
  assert.equal((await kind(412))!.kind, "conflict");
  assert.equal((await kind(500))!.kind, "transient");
  assert.equal((await kind(503))!.kind, "transient");
  const rl = (await kind(429, { "retry-after": "120" }))!;
  assert.deepEqual([rl.kind, rl.retryAfterMs], ["rate_limited", 120_000]);
  assert.equal((await kind(429, { "retry-after": "999999" }))!.retryAfterMs, 3_600_000);
  assert.equal((await kind(429))!.retryAfterMs, undefined);
  assert.ok(!(await kind(400))!.message.includes("secret"), "response bodies never end up in error messages");
});
test("network failures and malformed responses are transient, not fatal", async () => {
  const down = createPeopleApi({ fetchImpl: async () => { throw new Error("ECONNRESET"); } });
  await assert.rejects(down.createContact("T", contact), (e: unknown) => e instanceof PeopleApiError && e.kind === "transient");
  const odd = createPeopleApi({ fetchImpl: async () => res(200, { nothing: true }) });
  await assert.rejects(odd.createContact("T", contact), (e: unknown) => e instanceof PeopleApiError && e.kind === "transient");
});
test("the adapter has no delete operation: a local delete can never remove a Google contact", () => {
  assert.deepEqual(Object.keys(createPeopleApi()).sort(), ["createContact", "updateContact"]);
});
