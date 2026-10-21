#!/usr/bin/env bash
# Encrypted PostgreSQL backup: pg_dump (custom format) | AES-256 (openssl, PBKDF2) -> $BACKUP_DIR, optional rclone off-site copy,
# old files pruned. Every run is recorded in ops_backups so the admin console and the alerts see it.
# Usage: scripts/backup.sh            (installed as a daily systemd timer by install.sh)
source "$(dirname "$0")/lib.sh"

DIR="$(env_get BACKUP_DIR)"; DIR="${DIR:-/var/backups/syrix-vcf}"
KEEP="$(env_get BACKUP_KEEP_DAYS)"; KEEP="${KEEP:-14}"
PASS="$(env_get BACKUP_PASSPHRASE)"; [ -n "$PASS" ] || die "BACKUP_PASSPHRASE is empty in .env"
REMOTE="$(env_get RCLONE_REMOTE)"
mkdir -p "$DIR"; chmod 700 "$DIR"

NAME="syrix-$(date -u +%Y%m%dT%H%M%SZ).dump.enc"
ID="$(psql_exec "INSERT INTO ops_backups (status, file_name) VALUES ('running', '$NAME') RETURNING id" | head -n1)"
fail() { psql_exec "UPDATE ops_backups SET status='failed', finished_at=now(), error=left('$(printf '%s' "$1" | tr -d "'")', 500) WHERE id=$ID" || true; rm -f "$DIR/$NAME.part"; die "$1"; }
trap 'fail "backup interrupted"' INT TERM

log "dumping database to $DIR/$NAME"
if ! dc exec -T postgres pg_dump -U syrix -d syrix -Fc --no-owner \
   | BACKUP_PASSPHRASE="$PASS" openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:BACKUP_PASSPHRASE -out "$DIR/$NAME.part"; then
  fail "pg_dump or encryption failed"
fi
# a dump that cannot be decrypted and read back is not a backup
is_dump "$DIR/$NAME.part" "$PASS" || fail "verification failed: the file does not decrypt to a PostgreSQL dump"
mv "$DIR/$NAME.part" "$DIR/$NAME"; chmod 600 "$DIR/$NAME"
sha256sum "$DIR/$NAME" | awk '{print $1}' > "$DIR/$NAME.sha256"
SIZE="$(stat -c %s "$DIR/$NAME")"

OFFSITE=false
if [ -n "$REMOTE" ]; then
  if command -v rclone >/dev/null && rclone copy "$DIR/$NAME" "$REMOTE" && rclone copy "$DIR/$NAME.sha256" "$REMOTE"; then OFFSITE=true; log "copied off-site to $REMOTE"
  else psql_exec "UPDATE ops_backups SET status='failed', finished_at=now(), size_bytes=$SIZE, error='off-site copy failed (local copy kept)' WHERE id=$ID"; die "off-site copy to $REMOTE failed; the local file $DIR/$NAME is kept"; fi
fi
psql_exec "UPDATE ops_backups SET status='ok', finished_at=now(), size_bytes=$SIZE, offsite=$OFFSITE WHERE id=$ID"
find "$DIR" -maxdepth 1 -name 'syrix-*.dump.enc*' -mtime "+$KEEP" -print -delete | sed 's/^/pruned /' || true
log "backup ok: $NAME ($SIZE bytes, off-site: $OFFSITE)"
