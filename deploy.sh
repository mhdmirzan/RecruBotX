#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# RecruBotX – Hostinger VPS Deployment Script
# Run this script on your VPS after first-time setup or to update the app.
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_URL="git@github.com:mhdmirzan/RecruBotX.git"
APP_DIR="/opt/recrubotx"

echo "════════════════════════════════════════════════"
echo "  RecruBotX – Hostinger VPS Deployment"
echo "════════════════════════════════════════════════"

# ── 1. Install Docker & Docker Compose (first run only) ──────────────────────
if ! command -v docker &> /dev/null; then
  echo "→ Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker "$USER"
  echo "Docker installed. Re-login if permission issues occur."
fi

if ! command -v docker compose &> /dev/null; then
  echo "→ Installing Docker Compose plugin..."
  apt-get update -y && apt-get install -y docker-compose-plugin
fi

# ── 2. Clone or update repo ───────────────────────────────────────────────────
if [ ! -d "$APP_DIR/.git" ]; then
  echo "→ Cloning repository..."
  git clone "$REPO_URL" "$APP_DIR"
else
  echo "→ Pulling latest changes..."
  cd "$APP_DIR"
  git pull origin main
fi

cd "$APP_DIR"

# ── 3. Ensure .env exists ─────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo ""
  echo "⚠  No .env file found!"
  echo "   Copy .env.example → .env and fill in your secrets:"
  echo "   cp .env.example .env && nano .env"
  echo ""
  exit 1
fi

# ── 4. Build & start containers ───────────────────────────────────────────────
echo "→ Building and starting containers..."
docker compose pull --ignore-buildable 2>/dev/null || true
docker compose build --no-cache
docker compose up -d --remove-orphans

# ── 5. Cleanup old images ─────────────────────────────────────────────────────
echo "→ Pruning unused Docker images..."
docker image prune -f

echo ""
echo "✅  Deployment complete!"
echo "   Frontend : http://$(curl -s ifconfig.me)"
echo "   Backend  : http://$(curl -s ifconfig.me)/api"
echo ""
