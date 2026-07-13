#!/bin/bash
set -e

echo "========================================="
echo "  24Hour News - Production Deploy Script"
echo "========================================="

APP_DIR="/home/24hournews"
REPO_URL="https://github.com/lilromeo2290/24HourNews.git"
BRANCH="main"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

step() {
    echo -e "\n${GREEN}[$(date '+%H:%M:%S')] STEP: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# -------------------------------------------------------
# 1. Install system dependencies
# -------------------------------------------------------
step "Installing system dependencies"
sudo apt-get update -qq
sudo apt-get install -y -qq curl git nginx sqlite3 > /dev/null 2>&1

# -------------------------------------------------------
# 2. Install Node.js 22.x (LTS)
# -------------------------------------------------------
step "Checking Node.js"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d. -f1)" -lt 20 ]; then
    echo "Installing Node.js 22.x..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

# -------------------------------------------------------
# 3. Install PM2 globally
# -------------------------------------------------------
step "Installing PM2"
sudo npm install -g pm2
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# -------------------------------------------------------
# 4. Clone or pull the repository
# -------------------------------------------------------
step "Setting up project files"
if [ -d "$APP_DIR/.git" ]; then
    echo "Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin "$BRANCH"
else
    echo "Cloning repository..."
    mkdir -p "$APP_DIR"
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# -------------------------------------------------------
# 5. Install dependencies
# -------------------------------------------------------
step "Installing npm packages"
npm install --production=false

# -------------------------------------------------------
# 6. Set up environment
# -------------------------------------------------------
step "Configuring environment"
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo "Created .env from .env.example — please review it."
else
    echo ".env already exists, keeping it."
fi

# -------------------------------------------------------
# 7. Set up database
# -------------------------------------------------------
step "Setting up database"
mkdir -p "$APP_DIR/db"

if [ ! -f "$APP_DIR/db/custom.db" ]; then
    echo "Creating fresh database..."
    npx prisma db push --skip-generate
    echo "Database created. Seeding..."
    npx prisma db seed
    echo "Database seeded with sample data."
else
    echo "Database exists, running migrations..."
    npx prisma db push --skip-generate
fi

# -------------------------------------------------------
# 8. Build the Next.js app
# -------------------------------------------------------
step "Building Next.js (standalone)"
npm run build

# Verify standalone output
if [ ! -f "$APP_DIR/.next/standalone/server.js" ]; then
    error "Build failed — standalone/server.js not found!"
fi
echo "Build successful."

# -------------------------------------------------------
# 9. Set up logs directory
# -------------------------------------------------------
mkdir -p "$APP_DIR/logs"

# -------------------------------------------------------
# 10. Start/restart with PM2
# -------------------------------------------------------
step "Starting application with PM2"
pm2 delete 24hournews 2>/dev/null || true
pm2 start "$APP_DIR/ecosystem.config.js"
pm2 save

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}  Deploy complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "App is running on port 3000"
echo "PM2 commands:"
echo "  pm2 logs 24hournews    - View logs"
echo "  pm2 restart 24hournews - Restart app"
echo "  pm2 stop 24hournews    - Stop app"
echo ""
echo "Next step: Configure Nginx (see nginx.conf.example)"
echo "  1. Copy nginx.conf.example to /etc/nginx/conf.d/24hournews.conf"
echo "  2. Replace 'yourdomain.com' with your actual domain"
echo "  3. Run: sudo nginx -t && sudo systemctl reload nginx"