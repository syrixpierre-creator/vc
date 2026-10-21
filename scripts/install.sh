#!/usr/bin/env bash
# SYRIX VCF — one-command install on a fresh Ubuntu/Debian VPS. Safe to run again: it never regenerates existing secrets,
# never deletes data, and only changes what is missing or out of date.
#
#   sudo scripts/install.sh                                   (asks for what it needs)
#   sudo scripts/install.sh --domain vcf.example.com --admin-email syrixcompany@gmail.com \
#        --google-client-id ID --google-client-secret SECRET --yes
#
# Options: --domain, --admin-email, --google-client-id, --google-client-secret, --yes (no questions),
#          --skip-system (do not install packages, firewall or the backup timer: for containers and CI)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
ENV_FILE="$ROOT/.env"
DOMAIN="" ADMIN="" GID="" GSECRET="" YES=false SKIP_SYSTEM=false
while [ $# -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2 ;;
    --admin-email) ADMIN="$2"; shift 2 ;;
    --google-client-id) GID="$2"; shift 2 ;;
    --google-client-secret) GSECRET="$2"; shift 2 ;;
    --yes|-y) YES=true; shift ;;
    --skip-system) SKIP_SYSTEM=true; shift ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

say() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$*" >&2; }
die() { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }
ask() { # ask VAR "question" [default]
  local cur="${!1}"; [ -n "$cur" ] && return 0
  $YES && { [ -n "${3:-}" ] && printf -v "$1" '%s' "$3"; return 0; }
  local a; read -r -p "$2${3:+ [$3]}: " a; printf -v "$1" '%s' "${a:-${3:-}}"
}
env_get() { local v; v="$(grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"; v="${v%%[[:space:]]#*}"; v="${v%"${v##*[![:space:]]}"}"; printf '%s' "$v"; }
# Sets KEY=value in .env only when the current value is empty or still an example placeholder (unless force=1).
env_set() {
  local key="$1" val="$2" force="${3:-0}" cur; cur="$(env_get "$key")"
  if [ "$force" != 1 ] && [ -n "$cur" ] && [[ "$cur" != generate-with* ]] && [[ "$cur" != *example.com* ]]; then return 0; fi
  if grep -qE "^$key=" "$ENV_FILE"; then
    local tmp; tmp="$(mktemp)"; awk -v k="$key" -v v="$val" -F= 'BEGIN{OFS="="} $1==k{print k"="v; next} {print}' "$ENV_FILE" > "$tmp" && cat "$tmp" > "$ENV_FILE" && rm -f "$tmp"
  else printf '%s=%s\n' "$key" "$val" >> "$ENV_FILE"; fi
}
secret() { openssl rand -hex "$1"; }

[ "$(id -u)" = 0 ] || $SKIP_SYSTEM || die "run as root: sudo scripts/install.sh"

# 1. system packages, Docker, firewall
if ! $SKIP_SYSTEM; then
  [ -r /etc/os-release ] && . /etc/os-release
  case "${ID:-}" in ubuntu|debian) ;; *) warn "tested on Ubuntu 22.04/24.04 and Debian 12; continuing on ${PRETTY_NAME:-unknown}";; esac
  say "installing base packages"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg openssl ufw cron >/dev/null
  if ! docker compose version >/dev/null 2>&1; then
    say "installing Docker Engine and the Compose plugin (official repository)"
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL "https://download.docker.com/linux/${ID}/gpg" | gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
    apt-get update -qq && apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >/dev/null
  fi
  systemctl enable --now docker >/dev/null 2>&1 || true
  say "firewall: SSH, HTTP and HTTPS only"
  ufw allow OpenSSH >/dev/null; ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null; ufw allow 443/udp >/dev/null
  ufw --force enable >/dev/null
fi
docker compose version >/dev/null 2>&1 || die "Docker with the Compose plugin is required"

# 2. configuration (.env): created once, secrets generated once, never overwritten
if [ ! -f "$ENV_FILE" ]; then say "creating .env from .env.example"; cp .env.example "$ENV_FILE"; fi
chmod 600 "$ENV_FILE"
cur_domain="$(env_get DOMAIN)"; [[ "$cur_domain" == *example.com* ]] && cur_domain=""
DOMAIN="${DOMAIN:-$cur_domain}"; ask DOMAIN "Domain name for the site (its DNS must point to this server)"
[ -n "$DOMAIN" ] || die "a domain is required (use --domain)"
cur_admin="$(env_get ADMIN_EMAIL)"; ADMIN="${ADMIN:-$cur_admin}"; ask ADMIN "Administrator Google e-mail" "syrixcompany@gmail.com"
cur_gid="$(env_get GOOGLE_CLIENT_ID)"; GID="${GID:-$cur_gid}"; ask GID "Google OAuth client ID"
cur_gs="$(env_get GOOGLE_CLIENT_SECRET)"; GSECRET="${GSECRET:-$cur_gs}"
if [ -z "$GSECRET" ] && ! $YES; then read -r -s -p "Google OAuth client secret (hidden): " GSECRET; echo; fi
[ -n "$GID" ] && [ -n "$GSECRET" ] || die "Google OAuth client ID and secret are required (see docs/GOOGLE_SETUP.md)"

env_set DOMAIN "$DOMAIN" 1
env_set APP_URL "https://$DOMAIN" 1
env_set GOOGLE_REDIRECT_URI "https://$DOMAIN/api/auth/google/callback" 1
env_set ADMIN_EMAIL "$ADMIN" 1
env_set ACME_EMAIL "$ADMIN"
env_set SUPPORT_EMAIL "$ADMIN"
env_set EMAIL_FROM "SYRIX VCF <no-reply@$DOMAIN>"
env_set GOOGLE_CLIENT_ID "$GID" 1
env_set GOOGLE_CLIENT_SECRET "$GSECRET" 1
for k in POSTGRES_PASSWORD:24 REDIS_PASSWORD:24 SESSION_SECRET:32 ENCRYPTION_KEY:32 BACKUP_PASSPHRASE:32; do env_set "${k%%:*}" "$(secret "${k##*:}")"; done
grep -qE '^(POSTGRES_PASSWORD|SESSION_SECRET|ENCRYPTION_KEY)=generate-with' "$ENV_FILE" && die "secrets were not generated"

# 3. DNS sanity check (HTTPS needs it; a warning only)
if command -v getent >/dev/null; then
  dns_ip="$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk 'NR==1{print $1}')"
  my_ip="$(curl -fsS4 --max-time 5 https://api.ipify.org 2>/dev/null || true)"
  if [ -z "$dns_ip" ]; then warn "$DOMAIN does not resolve yet: HTTPS starts once DNS points to this server"
  elif [ -n "$my_ip" ] && [ "$dns_ip" != "$my_ip" ]; then warn "$DOMAIN points to $dns_ip but this server is $my_ip"; fi
fi

# 4. build and start (migrations run automatically before the app starts)
say "building the image and starting the stack"
dc() { docker compose --env-file "$ENV_FILE" -f "$ROOT/docker-compose.yml" "$@"; }
pull=(--pull); [ -n "${SYRIX_NO_PULL:-}" ] && pull=()   # SYRIX_NO_PULL=1 reuses the local base image (e.g. registry rate limits)
if [ -n "${SYRIX_SKIP_BUILD:-}" ]; then docker image inspect "syrix-vcf:${APP_VERSION:-latest}" >/dev/null || die "SYRIX_SKIP_BUILD is set but the image syrix-vcf:${APP_VERSION:-latest} is missing"   # image loaded beforehand (air-gapped)
else dc build "${pull[@]}" app; fi
dc up -d --remove-orphans
say "waiting for the app to become ready"
ready=false
for _ in $(seq 1 60); do
  if dc exec -T app node -e "fetch('http://127.0.0.1:3000/readyz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1; then ready=true; break; fi
  sleep 3
done
$ready || { dc ps; dc logs --tail 50 app; die "the app did not become ready"; }

# 5. daily encrypted backups (systemd timer)
if ! $SKIP_SYSTEM; then
  bdir="$(env_get BACKUP_DIR)"; mkdir -p "${bdir:-/var/backups/syrix-vcf}"; chmod 700 "${bdir:-/var/backups/syrix-vcf}"
  cat > /etc/systemd/system/syrix-vcf-backup.service <<UNIT
[Unit]
Description=SYRIX VCF encrypted database backup
After=docker.service
[Service]
Type=oneshot
ExecStart=$ROOT/scripts/backup.sh
UNIT
  cat > /etc/systemd/system/syrix-vcf-backup.timer <<UNIT
[Unit]
Description=Daily SYRIX VCF backup
[Timer]
OnCalendar=*-*-* 03:17:00
RandomizedDelaySec=10m
Persistent=true
[Install]
WantedBy=timers.target
UNIT
  systemctl daemon-reload && systemctl enable --now syrix-vcf-backup.timer >/dev/null
  say "daily backup timer enabled (systemctl list-timers syrix-vcf-backup.timer)"
fi

dc ps
cat <<DONE

SYRIX VCF is running.
  Site:            https://$DOMAIN
  Admin:           sign in with Google as $ADMIN, then open https://$DOMAIN/admin/
  Google console:  authorised redirect URI  https://$DOMAIN/api/auth/google/callback
                   authorised JavaScript origin  https://$DOMAIN
  Configuration:   $ENV_FILE (secrets generated once; keep a copy of ENCRYPTION_KEY and BACKUP_PASSPHRASE off this server)
  Backups:         scripts/backup.sh (daily), scripts/restore.sh <file>
  Update later:    git pull && sudo scripts/install.sh --yes
DONE
