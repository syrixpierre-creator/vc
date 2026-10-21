#!/usr/bin/env bash
# Restores an encrypted backup made by backup.sh into the running stack. DESTRUCTIVE: replaces the current database.
# Usage: scripts/restore.sh /var/backups/syrix-vcf/syrix-YYYYMMDDTHHMMSSZ.dump.enc [--yes]
source "$(dirname "$0")/lib.sh"
FILE="${1:-}"; [ -f "$FILE" ] || die "usage: scripts/restore.sh <backup file> [--yes]"
PASS="$(env_get BACKUP_PASSPHRASE)"; [ -n "$PASS" ] || die "BACKUP_PASSPHRASE is empty in .env"
if [ -f "$FILE.sha256" ]; then [ "$(sha256sum "$FILE" | awk '{print $1}')" = "$(cat "$FILE.sha256")" ] || die "checksum mismatch: the file is damaged"; log "checksum ok"; fi
is_dump "$FILE" "$PASS" || die "cannot decrypt $FILE with BACKUP_PASSPHRASE"

if [ "${2:-}" != "--yes" ]; then
  echo "This REPLACES the current database with $FILE."
  read -r -p "Type RESTORE to continue: " answer; [ "$answer" = "RESTORE" ] || die "cancelled"
fi
log "safety backup of the current database first"
"$ROOT/scripts/backup.sh" || log "warning: safety backup failed (continuing because you confirmed)"
log "stopping app and worker"
dc stop app worker caddy
log "restoring"
BACKUP_PASSPHRASE="$PASS" openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE -in "$FILE" \
  | dc exec -T postgres pg_restore -U syrix -d syrix --clean --if-exists --no-owner --single-transaction --exit-on-error
# the dump was taken while its own ops_backups row said 'running': record what is actually known now
NAME="$(basename "$FILE")"
psql_exec "UPDATE ops_backups SET status='ok', finished_at=COALESCE(finished_at, now()), error=NULL WHERE status='running' AND file_name='$NAME'; UPDATE ops_backups SET status='failed', finished_at=now(), error='interrupted (state captured inside a restored backup)' WHERE status='running'"
log "starting app (migrations bring the schema up to date) and worker"
dc up -d app worker caddy
for i in $(seq 1 30); do
  if dc exec -T app node -e "fetch('http://127.0.0.1:3000/readyz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then log "restore complete; the app is ready"; exit 0; fi
  sleep 3
done
die "the app did not become ready after the restore; check: docker compose logs app"
