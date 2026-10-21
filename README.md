# SYRIX VCF — BY SYRIX VISION COMPANY

## Status (honest checklist)

| Area | State |
|---|---|
| Reward maths (integer cents, $0.01 per referral = $5 at 500, $15 minimum withdrawal reached at 1,500, 1M cap) | Implemented, 158 automated tests pass (`cd server && npm test`) |
| Append-only ledger, payout state machine (paid needs confirmation + reference) | Implemented, tested |
| VCF 2.1 / 3.0 / 4.0 import and export (UTF-8, escaping, folding, injection-safe, limits) | Implemented, tested |
| Phone E.164 normalisation, one number per contact, masking | Implemented, tested |
| Startup config validation, AES-256-GCM encryption with key rotation | Implemented, tested |
| Google OIDC: state, nonce, PKCE, RS256 ID-token verification (alg none / HS256 / wrong aud / expired rejected), separate incremental Contacts scope | Implemented, tested with locally signed tokens (no live Google call yet) |
| Hashed server-side sessions with rotation and expiry, `__Host-` cookie, CSRF token + origin check, safe redirects, rate limiter | Implemented, tested |
| Roles and permissions (least privilege), admin bootstrap from verified ADMIN_EMAIL with Google subject pinning | Implemented, tested |
| Referral qualification (hard rules disqualify, risk signals go to review, waiting period keeps pending), challenge engine (window, dedupe, distinct days, winner cap, cash budget, frozen terms, 8-per-month rule), XP levels, VIP ranks, streaks | Implemented, tested |
| HTTP API on `node:http` (no dependencies): Google login flow (browser-bound state, one-time state, session fixation safe), CSRF + origin checks, contacts CRUD with anti-IDOR ownership, mass-assignment guard, VCF import preview/commit and export, read-only wallet, admin payout status with RBAC + audit + ledger | Implemented, 18 end-to-end tests against a real local server with a fake Google (signed tokens) |
| Google client (token exchange with PKCE, JWKS cache, timeouts) | Implemented, tested with an injected `fetch`; **no live Google call yet** |
| One phone number per account (unique across accounts, always masked in responses), referral attribution at registration, qualification job, admin review of flagged referrals, reward budget caps (per user and global) | Implemented, tested (`flow.test.ts`) |
| Payout methods (AES-256-GCM, masked hints only), withdrawal request (minimum, one open request, idempotency key, per-user lock, frozen recipient snapshot), masked admin payout list | Implemented, tested including parallel requests |
| Google Contacts sync engine: idempotent queue, exponential backoff + Retry-After, revoked auth stops retries, pause/resume, no remote delete, per-tick quota budget | Implemented with injectable ports, tested (`sync.test.ts`); **real People API adapter not written yet** |
| Ads: off by default, config validated, consent banner, labelled slots only on landing + dashboard overview, none on admin/contacts/wallet pages, public config endpoint without secrets | Implemented and checked in a browser; **no ad network connected or approved** (see `docs/ADS_POLICY.md`) |
| Challenges, XP, levels, VIP, streaks, leaderboard: server-computed progress from verified events (replay-safe), one claim per challenge, winner cap + cash budget under a lock, admin create/edit/publish with the 8-per-month rule and frozen terms after someone qualifies, opt-in pseudonym-only leaderboard, non-cash rewards tracked as pending manual fulfilment | Implemented, tested (`challenges.test.ts`); race tests verified by mutation (they fail when the lock is removed) |
| `PgStore` (PostgreSQL adapter for every Store method), migration runner, migration `0003`, `main.ts`, `worker.ts` (referral job only), `/readyz` | Written; SQL **shape** tested with a recording fake (ownership scoping, bound parameters, ON CONFLICT idempotency, unique-violation mapping, mutation-checked). **Never run against a real PostgreSQL** |
| People API adapter (create/update only, validated resource names, error mapping incl. conflict) | Implemented, tested with a fake `fetch`; **no live Google call yet** |
| **Logged-in web app** (`web/app/`, vanilla JS, no dependencies): overview, contacts (add/edit/delete with confirmation, search, pagination, VCF import with preview, VCF export), wallet (payout methods, withdrawal request, history), referrals, challenges + leaderboard, settings (language, one phone per account, pseudonym). 5 languages, Arabic RTL, no `innerHTML` (stored text cannot execute) | Implemented; **50 end-to-end checks pass in Chromium** against the local demo server (`python3 e2e/run.py`) |
| Local demo server (`npm run dev` in `server/`): in-memory data, fake Google sign-in page, refuses to run in production | Implemented |
| **Google Contacts sync, end to end**: separate incremental consent (Contacts scope only when the user asks), granular-consent and cancel handling, same-Google-account rule, tokens encrypted and bound to their owner, auto-queue on save/edit/import, worker loop (10 s) with backoff, token refresh, revoked-access detection and reconnect, pause/resume, Sync now backfill, disconnect (revokes at Google, deletes tokens, local data untouched), conflict flagging, no remote delete ever | Implemented and tested with a fake Google + fake People API: 14 sync-flow tests (3 safety rules mutation-checked) + browser run of the whole journey. **Never run against the real Google** |
| Queue storage | Job state lives in PostgreSQL (atomic claim, stale-job recovery), not BullMQ/Redis. Redis is provisioned but unused so far; nothing is lost if Redis restarts. Say if you want BullMQ added for wake-ups |
| PostgreSQL schema (all required tables, constraints, ledger triggers, `request_payout`, `qualify_referral`) | Written, **not yet run against a live database** |
| Docker Compose, Caddy, `.env.example` | Written, **not yet started** (no Docker in the build sandbox) |
| Real Google round-trip (needs your OAuth client + domain), the admin web UI (`web/admin.html` is a static preview), account deletion/export, support tickets, notifications centre, backup/restore UI, onboarding wizard, install.sh | **Not started** |
| Marketing preview (`web/`) | Static design preview only, demo data |

Nothing above marked "not yet" should be described as working.

## Run the tests

    cd server && npm test        # Node 22+, no dependencies needed

## Open product decisions
- Rate is linear at $0.01 per qualified referral ($5 at 500, $10 at 1,000, $15 withdrawable at 1,500). Approved.
- Budget caps: per user $10,000, global **$100** (approved). At $0.01 per referral that is 10,000 qualified referrals in total across all users, so very few users will reach the $15 withdrawal minimum until the budget is raised (`system_settings.reward_budget`).
- Phone: one number per ACCOUNT (profile number, unique across accounts). Contacts in the address book still hold one number each. If you meant that an account may only store a single contact, say so: that would change the product.

## Known limits to fix before launch
- Run **one** `app` replica. Locks that stop double payouts and over-awarded challenges are in-process; the database also blocks a second open payout per user and replayed ledger/XP keys, but winner caps are not DB-enforced yet.
- `server/package-lock.json` does not exist (no network when this was written). Run `npm install` in `server/` once and commit the lockfile.
- Never executed: Docker build, `docker compose up`, the SQL migrations, a real Google login, a real People API call.
- Secrets live in `.env`; the deployment installer (`install.sh`) is not written.

## Try it locally (no database, no Google account)
    cd server && node src/dev.ts          # or: npm run dev
    open http://localhost:3000            # use Chrome or Firefox (cookies are Secure; Safari rejects them on http)
Click "Sign in with Google": a demo sign-in page appears. Data lives in memory and disappears on restart.
Optional demo data for the signed-in user: open `http://localhost:3000/dev/seed?email=<your demo email>`.
