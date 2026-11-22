#!/usr/bin/env bash
# QUEEN AKUMA — add a 2nd server on this VPS, same website, sessions balanced.
# Usage (from ~/vc):  bash add-server.sh [2]
#   creates ~/vc2  (pm2: queen-akuma-2, port 5001, bot ports 7100+)
#   the website (server 1) sends each NEW number to the server with fewer linked bots.
set -e
N="${1:-2}"
SRC="$(cd "$(dirname "$0")" && pwd)"
DST="$HOME/vc$N"
PORT1="$(grep -E '^PORT=' "$SRC/.env" 2>/dev/null | cut -d= -f2 | tr -d '"\047 \r')"; PORT1="${PORT1:-5000}"
PORTN=$((PORT1 + N - 1))
BOTBASE=$((6100 + (N - 1) * 1000))

KEY="$(grep -E '^PEER_KEY=' "$SRC/.env" 2>/dev/null | cut -d= -f2 | tr -d '"\047 \r')"
[ -n "$KEY" ] || KEY="$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 32)"

setenv() { # file key value
  if grep -qE "^$2=" "$1" 2>/dev/null; then sed -i "s|^$2=.*|$2=$3|" "$1"; else echo "$2=$3" >> "$1"; fi
}
addpeer() { # file url
  local cur; cur="$(grep -E '^PEERS=' "$1" 2>/dev/null | cut -d= -f2 | tr -d '"\047 \r')"
  case ",$cur," in *",$2,"*) ;; *) setenv "$1" PEERS "${cur:+$cur,}$2";; esac
}

echo "==> Server $N in $DST (port $PORTN, bot ports $BOTBASE+)"
if [ ! -d "$DST/.git" ]; then
  git clone -q "$(git -C "$SRC" remote get-url origin)" "$DST"
else
  git -C "$DST" fetch -q origin && git -C "$DST" reset -q --hard origin/main
fi
[ -f "$DST/.env" ] || cp "$SRC/.env" "$DST/.env"
setenv "$DST/.env" PORT "$PORTN"
setenv "$DST/.env" BOT_PORT_BASE "$BOTBASE"
setenv "$DST/.env" PUBLIC_PAIRING true
setenv "$DST/.env" PEER_KEY "$KEY"
setenv "$SRC/.env" PEER_KEY "$KEY"
addpeer "$SRC/.env" "http://127.0.0.1:$PORTN"
addpeer "$DST/.env" "http://127.0.0.1:$PORT1"

echo "==> Installing modules (copy from server 1)"
[ -d "$DST/node_modules" ] || cp -a "$SRC/node_modules" "$DST/node_modules"

cd "$DST"
if pm2 describe "queen-akuma-$N" >/dev/null 2>&1; then pm2 restart "queen-akuma-$N" --update-env; else pm2 start manager.js --name "queen-akuma-$N"; fi
pm2 restart queen-akuma --update-env
pm2 save >/dev/null 2>&1 || true

sleep 3
echo ""
echo "✅ Server $N running. Sessions per server:"
curl -s "localhost:$PORT1/pair/stats"; echo
