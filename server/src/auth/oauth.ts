import { createHash, createPublicKey, randomBytes, timingSafeEqual, verify } from "node:crypto";

export const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
/** Sign-in only: identity, no access to contacts. */
export const LOGIN_SCOPES = ["openid", "email", "profile"] as const;
/** Requested separately, only after the user chooses to connect Google Contacts (needed to create contacts). */
export const CONTACTS_SCOPES = ["https://www.googleapis.com/auth/contacts"] as const;

const b64u = (b: Buffer) => b.toString("base64url");

export interface OAuthRequest { state: string; nonce: string; codeVerifier: string; codeChallenge: string }

/** Fresh per login attempt. Store it server-side (e.g. short-lived Redis key or signed cookie), never trust the browser copy. */
export function newOAuthRequest(): OAuthRequest {
  const codeVerifier = b64u(randomBytes(48));
  return {
    state: b64u(randomBytes(24)),
    nonce: b64u(randomBytes(24)),
    codeVerifier,
    codeChallenge: b64u(createHash("sha256").update(codeVerifier).digest()),
  };
}

export interface AuthUrlInput { clientId: string; redirectUri: string; scopes: readonly string[]; req: OAuthRequest; loginHint?: string; /** override for the local demo server only */ endpoint?: string }

export function buildAuthUrl(i: AuthUrlInput): string {
  const u = new URL(i.endpoint ?? GOOGLE_AUTH_ENDPOINT);
  u.searchParams.set("client_id", i.clientId);
  u.searchParams.set("redirect_uri", i.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", i.scopes.join(" "));
  u.searchParams.set("state", i.req.state);
  u.searchParams.set("nonce", i.req.nonce);
  u.searchParams.set("code_challenge", i.req.codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");
  if (i.scopes.some(s => s.includes("contacts"))) {
    u.searchParams.set("access_type", "offline"); // refresh token, only when Contacts sync is requested
    u.searchParams.set("include_granted_scopes", "true");
    u.searchParams.set("prompt", "consent");
  }
  if (i.loginHint) u.searchParams.set("login_hint", i.loginHint);
  return u.toString();
}

export function statesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

/* ---------- ID token verification (RS256 only) ---------- */

export interface Jwk { kid?: string; kty: string; n?: string; e?: string; alg?: string; use?: string }
export interface Jwks { keys: Jwk[] }
export interface IdTokenCheck { audience: string; nonce: string; now?: number; clockSkewSec?: number }
export interface GoogleIdentity { sub: string; email: string; emailVerified: boolean; name?: string; picture?: string }

const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

function parseJson(part: string): Record<string, unknown> {
  const v: unknown = JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  if (typeof v !== "object" || v === null || Array.isArray(v)) throw new Error("malformed token");
  return v as Record<string, unknown>;
}

/** Throws on any problem. Returns the identity only if signature, issuer, audience, expiry and nonce all check out. */
export function verifyIdToken(token: string, jwks: Jwks, check: IdTokenCheck): GoogleIdentity {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("malformed token");
  const [h, p, s] = parts as [string, string, string];
  const header = parseJson(h);
  if (header["alg"] !== "RS256") throw new Error("unsupported algorithm"); // blocks "none" and HS256 key-confusion
  const jwk = jwks.keys.find(k => k.kid === header["kid"] && k.kty === "RSA");
  if (!jwk) throw new Error("unknown signing key");

  const key = createPublicKey({ key: jwk as never, format: "jwk" });
  const ok = verify("RSA-SHA256", Buffer.from(`${h}.${p}`), key, Buffer.from(s, "base64url"));
  if (!ok) throw new Error("bad signature");

  const c = parseJson(p);
  const now = Math.floor((check.now ?? Date.now()) / 1000);
  const skew = check.clockSkewSec ?? 60;
  if (typeof c["iss"] !== "string" || !ISSUERS.includes(c["iss"])) throw new Error("bad issuer");
  const aud = c["aud"];
  if (!(aud === check.audience || (Array.isArray(aud) && aud.includes(check.audience)))) throw new Error("bad audience");
  if (typeof c["exp"] !== "number" || c["exp"] + skew < now) throw new Error("token expired");
  if (typeof c["iat"] === "number" && c["iat"] - skew > now) throw new Error("token issued in the future");
  if (typeof c["nonce"] !== "string" || !statesMatch(check.nonce, c["nonce"])) throw new Error("nonce mismatch");
  if (typeof c["sub"] !== "string" || !c["sub"]) throw new Error("missing subject");
  if (typeof c["email"] !== "string") throw new Error("missing email");
  if (c["email_verified"] !== true) throw new Error("email not verified");

  const id: GoogleIdentity = { sub: c["sub"], email: c["email"].toLowerCase(), emailVerified: true };
  if (typeof c["name"] === "string") id.name = c["name"];
  if (typeof c["picture"] === "string") id.picture = c["picture"];
  return id;
}
