#!/usr/bin/env bash
# QUEEN AKUMA — put the pairing site on your own (sub)domain with HTTPS.
# Usage:  sudo bash setup-domain.sh akuma.zone.id [email]
# Before: the DNS A record of the domain must point to this VPS IP.
set -e
DOMAIN="${1:-akuma.zone.id}"
EMAIL="${2:-}"
cd "$(dirname "$0")"
PORT="$(grep -E '^PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d '"\047 \r' || true)"; PORT="${PORT:-5000}"

echo "==> Domain: $DOMAIN  ->  127.0.0.1:$PORT"
IP="$(curl -s4 https://api.ipify.org || true)"
DNS="$(getent ahostsv4 "$DOMAIN" | awk '{print $1; exit}' || true)"
echo "    VPS IP: ${IP:-?}   DNS of $DOMAIN: ${DNS:-not found}"
if [ -n "$IP" ] && [ "$DNS" != "$IP" ]; then
  echo "!!  $DOMAIN does not point to this VPS yet. Add the A record, wait a few minutes, then run again."
  exit 1
fi

apt-get update -y >/dev/null
apt-get install -y nginx certbot python3-certbot-nginx >/dev/null

cat > /etc/nginx/sites-available/queen-akuma <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 10m;
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/queen-akuma /etc/nginx/sites-enabled/queen-akuma
nginx -t
systemctl enable --now nginx >/dev/null 2>&1 || true
systemctl reload nginx

# open the web ports if ufw is active
if command -v ufw >/dev/null && ufw status | grep -q active; then ufw allow 80/tcp; ufw allow 443/tcp; fi

if [ -n "$EMAIL" ]; then
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
else
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect
fi

grep -q '^PUBLIC_PAIRING=' .env 2>/dev/null && sed -i 's/^PUBLIC_PAIRING=.*/PUBLIC_PAIRING=true/' .env || echo 'PUBLIC_PAIRING=true' >> .env
pm2 restart queen-akuma --update-env >/dev/null 2>&1 || true

echo ""
echo "✅ https://$DOMAIN is live (pairing site). Admin panel: https://$DOMAIN/panel"
