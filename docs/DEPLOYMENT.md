# Deployment

## What runs
| Service | Role | Network |
|---|---|---|
| `caddy` | HTTPS (automatic Let's Encrypt), HTTP→HTTPS, HSTS, compression; forwards everything to `app` | publishes 80/443 |
| `app` | web pages, API, OpenAPI at `/api/openapi.json`; runs the database migrations before starting | `edge` + `private` |
| `worker` | BullMQ queues: Google Contacts sync, e-mail, maintenance (referral qualification, deletions, automatic backups, retention clean-up, alerts) | `edge` (outbound only) + `private` |
| `postgres` 16 | the single source of truth | `private` only (internal network, no internet, no published port) |
| `redis` 7 | queues and rate limits (password, append-only, no eviction). Losing it loses no data: the sweeper re-queues from PostgreSQL | `private` only |

`app` and `worker` run read-only, as a non-root user, without Linux capabilities, with `no-new-privileges`.

## Requirements
- A VPS with Ubuntu 22.04/24.04 or Debian 12, 2 vCPU / 2 GB RAM / 20 GB disk is enough to start.
- A domain whose DNS A (and AAAA if any) record points to the server.
- A Google OAuth client (see `GOOGLE_SETUP.md`).

## Install (one command)
```bash
git clone <your repository> /opt/syrix-vcf && cd /opt/syrix-vcf
sudo scripts/install.sh --domain vcf.example.com --admin-email syrixcompany@gmail.com \
     --google-client-id XXX.apps.googleusercontent.com --google-client-secret XXX --yes
```
Without options it asks for each value. It:
1. installs Docker Engine + Compose from Docker's official repository (if missing), `ufw` (allows SSH, 80, 443 only);
2. creates `.env` (mode 600) from `.env.example` and **generates every secret once** (database and Redis passwords, session secret, encryption key, backup passphrase). Running it again never changes existing secrets;
3. builds the image, starts the stack, waits until `/readyz` answers;
4. installs a systemd timer for a daily encrypted backup (03:17 + random delay).

**Copy `ENCRYPTION_KEY` and `BACKUP_PASSPHRASE` to a password manager off the server.** Without them, backups and stored tokens cannot be read.

Options: `--skip-system` (no packages, firewall or timer: for containers/CI), `SYRIX_NO_PULL=1` (reuse the local base image, e.g. registry rate limits), `SYRIX_SKIP_BUILD=1` (use an image loaded beforehand with `docker load`).

## Update
```bash
cd /opt/syrix-vcf && git pull && sudo scripts/install.sh --yes
```
Migrations run automatically when the new `app` container starts; if one fails, the old schema is untouched and the app does not start (`docker compose logs app`).

## Backups and restore
- `scripts/backup.sh`: `pg_dump` → AES-256 (OpenSSL, PBKDF2 200k iterations) → `$BACKUP_DIR` (default `/var/backups/syrix-vcf`, mode 700), SHA-256 file, verified by decrypting the header, pruned after `BACKUP_KEEP_DAYS` (14). Every run is recorded in `ops_backups`; the admin console shows the last one and the worker alerts when none succeeded for 48 h.
- Off-site copy: install and configure `rclone` on the host, then set `RCLONE_REMOTE=remote:bucket/path` in `.env`. A failed off-site copy marks the backup failed (the local file is kept).
- `scripts/restore.sh <file> [--yes]`: checks the checksum and the passphrase, makes a safety backup, stops app/worker, restores in one transaction, starts the app (migrations run), waits for `/readyz`.
- Users' own contact backups (inside the app) are separate: encrypted in the database, restored from the app.

**Test a restore** on a spare server at least once per quarter. This was tested end to end in Docker while building this release (backup → change → restore → the change is gone, app ready).

## Health and monitoring
- `GET /healthz` (process alive), `GET /readyz` (PostgreSQL and Redis reachable).
- Admin console → Overview: database, Redis, worker heartbeat, disk usage, last backup, queue sizes.
- Alerts (backup failed or older than 48 h, disk over 85 %, many sync failures, failed payouts, payouts waiting too long, spikes of failed sign-ins) are raised by the worker, logged, and posted to `ALERT_WEBHOOK_URL` if set (JSON; Slack/Discord-compatible), at most once per 6 hours per kind. A stopped worker cannot alert about itself: watch its heartbeat in the admin console or monitor `docker compose ps` externally.
- Logs: `docker compose logs -f app worker` (JSON lines; tokens, secrets and contact contents are never logged). Docker rotates them (10 MB × 5).

## Other platforms
The image is a standard Node 22 container (`node server/src/main.ts`, worker: `node server/src/worker.ts`, migrations: `node server/src/migrate.ts`). On Railway or Render: create a PostgreSQL 16 and a Redis service, deploy this repository twice from the Dockerfile (web service + background worker with the worker command), set the variables from `.env.example` (`DATABASE_URL`, `REDIS_URL`, `TRUST_PROXY=true`), and run the migration command as the pre-deploy step. These platforms terminate HTTPS themselves, so Caddy is not used. **Not tested** on those platforms.

## Ports and firewall
Only 22, 80 and 443 should be open. Docker publishes only Caddy's ports; PostgreSQL and Redis have none. Check with `sudo ss -tlnp`.
