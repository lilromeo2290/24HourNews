#!/bin/bash
# Quick update script — pull, rebuild, restart
set -e
APP_DIR="/home/24hournews"

echo "Pulling latest code..."
cd "$APP_DIR"
git pull origin main

echo "Installing dependencies..."
npm install --production=false

echo "Building..."
npm run build

echo "Restarting..."
pm2 restart 24hournews

echo "Done! App updated and restarted."
pm2 logs 24hournews --lines 5 --nostream