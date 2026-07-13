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

# Detect OS
if [ -f /etc/centos-release ] || [ -f /etc/redhat-release ] || [ -f /etc/rocky-release ]; then
    PKG_MGR="yum"
    echo "Detected CentOS/RHEL system"
elif [ -f /etc/debian_version ] || [ -f /etc/ubuntu-release ]; then
    PKG_MGR="apt"
    echo "Detected Debian/Ubuntu system"
else
    echo "Unknown OS, trying yum..."
    PKG_MGR="yum"
fi

# -------------------------------------------------------
# 1. Install system dependencies
# -------------------------------------------------------
step "Installing system dependencies"
if [ "$PKG_MGR" = "yum" ]; then
    yum install -y curl git sqlite make gcc-c++ > /dev/null 2>&1
    # Nginx may already be installed by Webuzo
    if ! command -v nginx &> /dev/null; then
        yum install -y nginx > /dev/null 2>&1 || warn "Nginx not installed via yum — Webuzo may handle it"
    fi
else
    apt-get update -qq
    apt-get install -y -qq curl git nginx sqlite3 build-essential > /dev/null 2>&1
fi

# -------------------------------------------------------
# 2. Install Node.js 22.x (LTS)
# -------------------------------------------------------
step "Checking Node.js"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d. -f1)" -lt 20 ]; then
    echo "Installing Node.js 22.x..."
    if [ "$PKG_MGR" = "yum" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
        yum install -y nodejs
    else
        curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
        apt-get install -y nodejs
    fi
fi
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

# -------------------------------------------------------
# 3. Install PM2 globally
# -------------------------------------------------------
step "Installing PM2"
npm install -g pm2
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
npm install

# -------------------------------------------------------
# 6. Set up environment
# -------------------------------------------------------
step "Configuring environment"
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo "Created .env from .env.example"
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
step "Building Next.js (standalone) — this may take a few minutes..."
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

# -------------------------------------------------------
# 11. Configure firewall (if active)
# -------------------------------------------------------
step "Checking firewall"
if command -v firewall-cmd &> /dev/null; then
    if firewall-cmd --state >/dev/null 2>&1; then
        firewall-cmd --permanent --add-port=3003/tcp 2>/dev/null || true
        firewall-cmd --reload 2>/dev/null || true
        echo "Firewall: port 3003 opened"
    fi
fi

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}  Deploy complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "App is running on port 3003"
echo ""
echo "PM2 commands:"
echo "  pm2 logs 24hournews    - View logs"
echo "  pm2 restart 24hournews - Restart app"
echo "  pm2 stop 24hournews    - Stop app"
echo ""
echo "Test it: curl http://localhost:3003"
echo ""
echo "Next: Configure Nginx reverse proxy"
echo "  1. Copy nginx.conf.example to Webuzo Nginx config"
echo "  2. Or add the location block to your domain's Nginx vhost"
echo "  3. Replace 'yourdomain.com' with your actual domain"
echo "  4. Test: nginx -t && systemctl reload nginx"