#!/bin/bash
set -e

SERVER="root@107.174.127.26"
PASS="CRtgUB2Uk5pT7la416"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=30"

echo "=========================================="
echo "  iAN Photography Gallery - Deployment"
echo "=========================================="
echo ""

echo "[1/4] Creating web root on server..."
sshpass -p "$PASS" ssh $SSH_OPTS "$SERVER" "mkdir -p /var/www/ian" < /dev/null

echo "[2/4] Uploading website files..."
cd "$(dirname "$0")"
sshpass -p "$PASS" rsync -avz --partial --progress -e "ssh $SSH_OPTS" \
  dist/ "$SERVER":/var/www/ian/

echo "[3/4] Uploading Nginx config..."
sshpass -p "$PASS" scp $SSH_OPTS deploy_nginx.conf "$SERVER":/etc/nginx/sites-available/ian

echo "[4/4] Configuring and restarting Nginx..."
sshpass -p "$PASS" ssh $SSH_OPTS "$SERVER" \
  "ln -sf /etc/nginx/sites-available/ian /etc/nginx/sites-enabled/ && \
   rm -f /etc/nginx/sites-enabled/default && \
   nginx -t && systemctl restart nginx && \
   echo 'NGINX OK'" < /dev/null

echo ""
echo "=========================================="
echo "  Deployment complete!"
echo "  Visit: http://107.174.127.26"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Set DNS A record: kozymonetaryraider.com -> 107.174.127.26"
echo "  2. Set up HTTPS:"
echo "     ssh $SERVER 'apt-get install -y certbot python3-certbot-nginx && certbot --nginx -d kozymonetaryraider.com -d www.kozymonetaryraider.com'"
