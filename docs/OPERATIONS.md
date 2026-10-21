# Operations: troubleshooting and incident response

All commands run from the install directory (e.g. `/opt/syrix-vcf`).

## Quick status
```bash
docker compose ps                       # every service Up; app (healthy)
curl -fsS https://YOUR-DOMAIN/readyz    # {"ok":true}
docker compose logs --tail 100 app worker
systemctl list-timers syrix-vcf-backup.timer
```
Admin console → Overview shows the same health items, queue sizes and the last backup.

## Troubleshooting
| Symptom | Likely cause | Fix |
|---|---|---|
| Browser shows a certificate error | DNS does not point to the server yet, or ports 80/443 blocked | `dig +short YOUR-DOMAIN`, open 80/443 (`ufw status`), then `docker compose logs caddy` |
| `app` restarts in a loop | a missing/invalid variable (the app lists every problem at start) or a failed migration | `docker compose logs app`; fix `.env`; `docker compose up -d` |
| "Sign-in problem: the link expired" | the user opened the Google page in another browser, waited > 10 min, or the clock is wrong | retry; check `timedatectl` |
| Google error `redirect_uri_mismatch` | the redirect URI in the Google console differs from `GOOGLE_REDIRECT_URI` | they must be identical, including `https://` and no trailing slash |
| "Access blocked: app not verified" at Google | the Contacts scope needs verification | add the user as a test user, or complete verification (`GOOGLE_SETUP.md`) |
| Users' sync shows "Needs reconnection" after 7 days | OAuth app still in *Testing* (Google expires refresh tokens) | publish/verify the app; users reconnect once |
| Contacts stay "Pending" | worker stopped, sync paused by the user, or Google quota | `docker compose ps worker`, worker logs, Admin → user → Retry failed sync jobs |
| E-mails not sent | `EMAIL_PROVIDER=none` (e-mails are only logged) or a wrong API key / unverified sender domain | set `EMAIL_PROVIDER=resend`, key and `EMAIL_FROM` on a verified domain |
| Admin console says "No admin access" | signed in with an account other than `ADMIN_EMAIL`, or the e-mail is not verified at Google | sign in with the exact `ADMIN_EMAIL` Google account |
| Disk alert | logs, images, backups | `docker system prune` (unused images), lower `BACKUP_KEEP_DAYS`, move backups off-site |
| Backup alert | backup timer not running or failing | `journalctl -u syrix-vcf-backup.service`, run `scripts/backup.sh` by hand |

## Incident response
1. **Contain**
   - Suspected account takeover: Admin → user → *Sign out everywhere*, then *Suspend* if needed (reason required, audited).
   - Leaked secret: rotate it (see `SECURITY.md` → Rotating secrets). Leaked `SESSION_SECRET` → change and restart (all sessions end). Leaked Google client secret → create a new one, update `.env`, delete the old one.
   - Abuse of referrals or rewards: restrict referrals/rewards on the accounts (bulk action available), pause payouts by leaving them *pending*.
   - Whole-site emergency: `docker compose stop caddy` takes the site offline while keeping data and the worker.
2. **Preserve evidence**: export Admin → Audit log and Security events; `docker compose logs --since 48h > incident.log`; take a backup (`scripts/backup.sh`) before changing data.
3. **Fix** the cause, deploy (`git pull && sudo scripts/install.sh --yes`).
4. **Recover data if needed**: `scripts/restore.sh <file>` (makes a safety backup first). Payout records and the ledger are append-only, so mistakes are corrected with *Ledger adjustment*, never by editing rows.
5. **Tell people**: if personal data may have been exposed, notify affected users and, where the law requires (e.g. GDPR: within 72 hours), the data protection authority. Post an announcement in the admin console.
6. **Write down** what happened, the timeline and what changes prevent it next time.

## Routine
- Weekly: read Admin → Overview (queues, failed payouts, referrals under review), handle support tickets.
- Monthly: publish at least eight challenges (Admin → Challenges → *Drafts from templates*), check the reward budget against real ad/other revenue.
- Quarterly: test a restore on a spare server; review admin roles; `git pull` updates.
