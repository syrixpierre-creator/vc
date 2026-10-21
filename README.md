# SYRIX VCF — BY SYRIX VISION COMPANY

Contact management with Google Contacts synchronisation, VCF import/export and encrypted backups, plus optional referral rewards, monthly challenges and progression. Five languages (English, French, Portuguese, Spanish, Arabic with right-to-left layout), a full admin console, and a one-command VPS installation.

Contact: syrixcompany@gmail.com

## Features
- **Contacts**: several numbers per contact (normalised to international format, duplicates refused), e-mails, company, notes, labels with colours, search/filter/sort, bulk actions, change history (which fields changed, never old values), duplicate suggestions and merge.
- **VCF**: import vCard 2.1/3.0/4.0 with a preview (new, already present, repeated, invalid with reasons) and skip/merge choice; export all, filtered or selected contacts as 3.0 or 4.0.
- **Backups**: users' encrypted backups (manual and weekly automatic, 30-day retention), restore that only re-creates what is missing (with a safety backup first).
- **Google Contacts sync**: separate, optional consent; background queue with retries, backoff, pause/resume, reconnect and conflict flags; never deletes anything in Google.
- **Referrals**: personal link, qualification rules with anti-fraud checks and human review, milestones (badges and XP), a one-time **$10.00** reward at 500 qualified referrals, paid manually.
- **Wallet**: append-only ledger, PayPal / Binance Pay / Pix payout methods (encrypted, masked), withdrawal requests and full payout timeline.
- **Challenges and progression**: at least eight monthly challenges in four tiers, server-verified progress, frozen terms, manual review where needed; XP, levels, VIP ranks, achievements, missions, streaks, opt-in pseudonymous leaderboards, share cards.
- **Community**: notifications centre, announcements (in app and on the website), support tickets with internal staff notes.
- **Account**: onboarding, profile, privacy settings, sessions (sign out other devices), security checkup, data export (JSON), account deletion with a 14-day grace period.
- **Admin console** (role-based): overview with live figures and system health, users (suspend, restrict, review, roles, ledger adjustments, sessions), referral review, deletions, payouts, reward delivery, challenges (templates, publishing), announcements, support desk, settings (reward policy, budgets, milestones, VIP ranks), audit log and security events, CSV reports. Contact contents are never shown to admins.

## Stack
Node 22 (TypeScript run directly, no build), PostgreSQL 16, Redis 7 + BullMQ, vanilla ES modules front end (no framework, strict CSP, SVG icon sprite and logo, bundled fonts), Caddy for HTTPS, Docker Compose. Database changes are plain SQL migrations in `db/migrations`.

```
server/src   http (router, routes, static files), domain (rules), store (PostgreSQL), services (queues, jobs, mail), sync (Google), auth, security
web/         index.html (website), app/ (user app), admin/ (console), legal/, js/, css/, assets/ (logo, icons, fonts)
db/          SQL migrations
scripts/     install.sh, backup.sh, restore.sh, pages.mjs (static pages), brand.mjs (logo/icons), i18n-check.mjs
e2e/         browser end-to-end tests
docs/        deployment, Google setup, payments, security, operations, ads policy
```

## Install on a server
See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**. Short version:
```bash
sudo scripts/install.sh --domain vcf.example.com --admin-email syrixcompany@gmail.com \
     --google-client-id ... --google-client-secret ...
```
Before that, create the Google OAuth client: **[docs/GOOGLE_SETUP.md](docs/GOOGLE_SETUP.md)**.

## Run locally
```bash
docker compose -f docker-compose.dev.yml up -d          # PostgreSQL + Redis on 127.0.0.1
cd server && npm install
DATABASE_URL=postgres://postgres:dev@127.0.0.1:5432/syrix_dev npm run dev
# open http://localhost:3000 (Chrome/Firefox). "Sign in with Google" opens a local stand-in page: no Google account needed.
# demo data for a signed-in user: http://localhost:3000/dev/seed?email=<that e-mail>
```
The dev server refuses to start with `NODE_ENV=production`.

## Tests
```bash
cd server
npm run typecheck
npm test                                   # 194 tests on a real PostgreSQL (TEST_DATABASE_URL, default postgres://postgres@127.0.0.1:5432/postgres)
node --test ../e2e/app.e2e.mjs             # browser end-to-end (DATABASE_ADMIN_URL as above; E2E_CHROMIUM=/path/to/chrome)
node ../scripts/i18n-check.mjs             # every text key exists in all five languages
npm audit                                  # 0 known vulnerabilities at release
```

## API
Every endpoint is declared with its access rule; the description is served at `/api/openapi.json` (OpenAPI 3.1). State-changing requests need the session cookie and the `X-CSRF-Token` header returned by `GET /api/me`.

## Documentation
- [Deployment, updates, backups](docs/DEPLOYMENT.md)
- [Google OAuth and People API setup](docs/GOOGLE_SETUP.md)
- [Rewards and payouts runbook](docs/PAYMENTS.md)
- [Security model](docs/SECURITY.md)
- [Troubleshooting and incident response](docs/OPERATIONS.md)
- [Ads policy](docs/ADS_POLICY.md)
- [Implementation report: what is done, tested, and not](IMPLEMENTATION_REPORT.md)

Translations live in `web/js/i18n/<lang>.js`; legal texts in `scripts/pages/*.mjs` (run `node scripts/pages.mjs` after editing). Legal texts are a plain-language base, not legal advice: have them reviewed before launch.
