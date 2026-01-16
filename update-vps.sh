#!/bin/bash

# VPS Update Script for Kampung Feature
# Usage: ./update-vps.sh

set -e  # Exit on error

echo "=========================================="
echo "VPS Update Script - Kampung Feature"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/root/projects/masjid"
BACKUP_DIR="/root/projects/masjid-backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Step 1: Create Backup
echo -e "${YELLOW}Step 1: Creating backup...${NC}"
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
cp -r "$PROJECT_DIR/backend" "$BACKUP_DIR/$BACKUP_NAME/backend" 2>/dev/null || true
cp -r "$PROJECT_DIR/frontend" "$BACKUP_DIR/$BACKUP_NAME/frontend" 2>/dev/null || true
echo -e "${GREEN}✓ Backup created: $BACKUP_DIR/$BACKUP_NAME${NC}"
echo ""

# Step 2: Navigate to project
cd "$PROJECT_DIR" || { echo -e "${RED}Error: Project directory not found!${NC}"; exit 1; }

# Step 3: Update Backend
echo -e "${YELLOW}Step 2: Updating backend...${NC}"
cd backend

# Install dependencies
echo "  Installing dependencies..."
npm install

# Generate Prisma client
echo "  Generating Prisma client..."
npx prisma generate

# Run database migration
echo "  Running database migration..."
if npx prisma migrate deploy; then
    echo -e "${GREEN}✓ Database migration successful${NC}"
else
    echo -e "${RED}✗ Database migration failed!${NC}"
    echo -e "${YELLOW}You may need to run migrations manually.${NC}"
    echo "  Try: npx prisma migrate dev --name add_kampung_model"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build backend
echo "  Building backend..."
npm run build
echo -e "${GREEN}✓ Backend updated successfully${NC}"
echo ""

# Step 4: Update Frontend
echo -e "${YELLOW}Step 3: Updating frontend...${NC}"
cd ../frontend

# Install dependencies
echo "  Installing dependencies..."
npm install

# Build frontend
echo "  Building frontend..."
npm run build
echo -e "${GREEN}✓ Frontend updated successfully${NC}"
echo ""

# Step 5: Restart Services
echo -e "${YELLOW}Step 4: Restarting services...${NC}"
cd ..

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2 not found! Please install PM2 first.${NC}"
    exit 1
fi

# Restart services
pm2 restart all
echo -e "${GREEN}✓ Services restarted${NC}"
echo ""

# Step 6: Show Status
echo -e "${YELLOW}Step 5: Service Status${NC}"
pm2 status
echo ""

# Step 7: Show Recent Logs
echo -e "${YELLOW}Recent Backend Logs (last 10 lines):${NC}"
pm2 logs mkcs-backend --lines 10 --nostream || true
echo ""

echo -e "${GREEN}=========================================="
echo "Update Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Check logs: pm2 logs"
echo "2. Test the website in your browser"
echo "3. Verify 'Pengurusan Kampung' appears in the menu"
echo "4. Try creating a new kampung"
echo ""
echo "If something went wrong, restore from backup:"
echo "  cp -r $BACKUP_DIR/$BACKUP_NAME/* $PROJECT_DIR/"
echo ""
