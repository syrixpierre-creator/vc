# Shared helpers for the operations scripts. Sourced, never executed.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
ENV_FILE="${ENV_FILE:-$ROOT/.env}"

# Reads one value from .env without executing the file (values may contain spaces or <>).
env_get() { local v; v="$(grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"; v="${v%%[[:space:]]#*}"; v="${v%"${v##*[![:space:]]}"}"; printf '%s' "$v"; }
log() { printf '[%s] %s\n' "$(date -u +%FT%TZ)" "$*"; }
die() { log "ERROR: $*" >&2; exit 1; }
dc() { docker compose --env-file "$ENV_FILE" -f "$ROOT/docker-compose.yml" "$@"; }
psql_exec() { dc exec -T postgres psql -v ON_ERROR_STOP=1 -qtA -U syrix -d syrix -c "$1"; }
# True when $1 decrypts with passphrase $2 to a PostgreSQL custom-format dump (reads only the first bytes).
is_dump() { ( set +o pipefail; BACKUP_PASSPHRASE="$2" openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE -in "$1" 2>/dev/null | head -c 5 | grep -q PGDMP ); }
