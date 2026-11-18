#!/usr/bin/env bash
# QUEEN AKUMA — one-command VPS deploy (Ubuntu/Debian)
# Usage:  bash deploy.sh
set -euo pipefail

echo ">>> QUEEN AKUMA — VPS deploy starting..."

# 1) System dependencies (Node 20, ffmpeg, git)
if ! command -v node >/dev/null 2>&1; then
  echo ">>> Installing Node.js 20 + ffmpeg + git..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs ffmpeg git
else
  command -v ffmpeg >/dev/null 2>&1 || sudo apt-get install -y ffmpeg || true
fi

# 2) Project dependencies
echo ">>> Installing npm packages..."
npm install --legacy-peer-deps

# 3) .env — create from template and set a panel password if missing
if [ ! -f .env ]; then
  [ -f sample.env ] && cp sample.env .env || touch .env
  echo ">>> Created .env"
fi
if ! grep -q '^ADMIN_PASSWORD=.\+' .env; then
  PW="$(head -c 6 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  if grep -q '^ADMIN_PASSWORD=' .env; then
    sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=${PW}|" .env
  else
    echo "ADMIN_PASSWORD=${PW}" >> .env
  fi
  echo ">>> Panel password (ADMIN_PASSWORD) set to: ${PW}"
fi

# Enable the public pairing site (/pair) by default
if grep -q '^PUBLIC_PAIRING=' .env; then
  sed -i "s|^PUBLIC_PAIRING=.*|PUBLIC_PAIRING=true|" .env
else
  echo "PUBLIC_PAIRING=true" >> .env
fi

# 4) pm2 — run the multi-session manager, keep it alive across reboots
if ! command -v pm2 >/dev/null 2>&1; then
  echo ">>> Installing pm2..."
  sudo npm install -g pm2
fi
pm2 start ecosystem.config.js --update-env || pm2 restart queen-akuma --update-env
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" >/dev/null 2>&1 || true

PORT="$(grep -E '^PORT=' .env | cut -d= -f2 || true)"; PORT="${PORT:-5000}"
echo ""
echo ">>> QUEEN AKUMA is deployed."
echo ">>> Panel:  http://<your-server-ip>:${PORT}/   (password = ADMIN_PASSWORD in .env)"
echo ">>> Pairing site (public): http://<your-server-ip>:${PORT}/pair"
echo ">>> Add a bot from the panel, or: node manager.js add <number>"
echo ">>> Logs:   pm2 logs queen-akuma"
