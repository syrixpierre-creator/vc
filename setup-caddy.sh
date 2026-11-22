#!/usr/bin/env bash
# QUEEN AKUMA — put the pairing site behind an EXISTING Caddy Docker container
# (when ports 80/443 are already used by Caddy). Your other sites are not touched.
# Usage:  sudo bash setup-caddy.sh akuma.skyhost.tech [caddy-container]
set -e
DOMAIN="${1:?Usage: setup-caddy.sh <domain> [caddy-container]}"
cd "$(dirname "$0")"
PORT="$(grep -E '^PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d '"\047 \r' || true)"; PORT="${PORT:-5000}"

C="${2:-$(docker ps --format '{{.Names}} {{.Image}}' | awk '$2 ~ /caddy/ {print $1; exit}')}"
[ -n "$C" ] || { echo "!! No Caddy container found."; exit 1; }
echo "==> Caddy container: $C"

# Caddyfile on the host (bind mount of /etc/caddy/Caddyfile or /etc/caddy)
SRC="$(docker inspect "$C" --format '{{range .Mounts}}{{if eq .Destination "/etc/caddy/Caddyfile"}}{{.Source}}{{end}}{{end}}')"
if [ -z "$SRC" ]; then
  DIR="$(docker inspect "$C" --format '{{range .Mounts}}{{if eq .Destination "/etc/caddy"}}{{.Source}}{{end}}{{end}}')"
  [ -n "$DIR" ] && SRC="$DIR/Caddyfile"
fi
[ -n "$SRC" ] && [ -f "$SRC" ] || { echo "!! Caddyfile of $C not found on the host (not mounted)."; exit 1; }
echo "    Caddyfile: $SRC"

# Address of this VPS as seen from inside the container (Docker network gateway)
GW="$(docker inspect "$C" --format '{{range .NetworkSettings.Networks}}{{.Gateway}} {{end}}' | awk '{print $1}')"
[ -n "$GW" ] || GW="172.17.0.1"
[ "$(docker inspect "$C" --format '{{.HostConfig.NetworkMode}}')" = "host" ] && GW="127.0.0.1"
SUBNET="$(docker network inspect "$(docker inspect "$C" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | awk '{print $1}')" --format '{{range .IPAM.Config}}{{.Subnet}} {{end}}' 2>/dev/null | awk '{print $1}')"
echo "    Bot site: http://$GW:$PORT"

# the Docker network must be allowed to reach the bot port
if command -v ufw >/dev/null && ufw status | grep -q active; then ufw allow from "${SUBNET:-172.16.0.0/12}" to any port "$PORT" proto tcp >/dev/null; fi

# our own Nginx is not needed (Caddy keeps 80/443)
systemctl disable --now nginx >/dev/null 2>&1 || true

cp "$SRC" "$SRC.bak.$(date +%s)"
# remove an older block for this domain, then add the new one
python3 - "$SRC" "$DOMAIN" <<'PY'
import sys,re
p,d=sys.argv[1],sys.argv[2]
s=open(p).read()
s=re.sub(r'\n?# QUEEN AKUMA BEGIN '+re.escape(d)+r'.*?# QUEEN AKUMA END '+re.escape(d)+r'\n?','\n',s,flags=re.S)
open(p,'w').write(s.rstrip('\n')+'\n')
PY
cat >> "$SRC" <<CADDY

# QUEEN AKUMA BEGIN $DOMAIN
$DOMAIN {
	encode gzip
	reverse_proxy $GW:$PORT
}
# QUEEN AKUMA END $DOMAIN
CADDY

if ! docker exec "$C" caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null 2>&1; then
  echo "!! Caddyfile invalid, restoring the backup."
  cp "$(ls -t "$SRC".bak.* | head -1)" "$SRC"
  docker exec "$C" caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile || true
  exit 1
fi
docker exec "$C" caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

grep -q '^PUBLIC_PAIRING=' .env 2>/dev/null && sed -i 's/^PUBLIC_PAIRING=.*/PUBLIC_PAIRING=true/' .env || echo 'PUBLIC_PAIRING=true' >> .env
pm2 restart queen-akuma --update-env >/dev/null 2>&1 || true

echo ""
echo "✅ https://$DOMAIN (HTTPS by Caddy, ready in ~30 s). Admin panel: https://$DOMAIN/panel"
