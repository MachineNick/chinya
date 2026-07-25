#!/bin/bash
# deploy.sh — Build and deploy static frontend to OVH VPS
# Usage: ./deploy.sh
# Requires: OVH_HOST, OVH_USER set as env vars or edit below

OVH_HOST="${OVH_HOST:-YOUR_OVH_VPS_IP}"
OVH_USER="${OVH_USER:-ubuntu}"
REMOTE_DIR="/var/www/winzo"

set -e

echo "▶ Generating env.js..."
node scripts/generate-env.js

echo "▶ Syncing frontend/public to OVH..."
rsync -az --delete frontend/public/ "$OVH_USER@$OVH_HOST:$REMOTE_DIR/public/"

echo "✓ Deploy complete."
