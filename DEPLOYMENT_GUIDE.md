# MKCS Deployment Guide

Complete guide for testing locally on Windows and deploying to VPS.

**Domain:** masjid.taskinsight.my  
**VPS Path:** /root/projects

---

## Table of Contents

1. [Local Testing (Windows)](#local-testing-windows)
2. [VPS Deployment](#vps-deployment)
3. [Post-Deployment Configuration](#post-deployment-configuration)
4. [Troubleshooting](#troubleshooting)

---

## Local Testing (Windows)

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/windows/)
- **Git** - [Download](https://git-scm.com/download/win)
- **Code Editor** (VS Code recommended)

### Step 1: Clone/Setup Project

```powershell
# Navigate to your project directory
cd C:\Users\User\Desktop\Website\masjid

# If using Git, clone the repository
# git clone <your-repo-url> masjid
# cd masjid
```

### Step 2: Install PostgreSQL

1. Download and install PostgreSQL 15+ from [postgresql.org](https://www.postgresql.org/download/windows/)
2. During installation, remember your PostgreSQL password
3. PostgreSQL will run on `localhost:5432` by default

### Step 3: Create Database

Open **pgAdmin** or **psql** and create the database:

```sql
CREATE DATABASE mkcs_db;
```

Or using command line:

```powershell
# Open psql (included with PostgreSQL)
psql -U postgres

# Then run:
CREATE DATABASE mkcs_db;
\q
```

### Step 4: Setup Backend

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the example and edit it
copy .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/mkcs_db
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
```

**Important:** Replace `YOUR_POSTGRES_PASSWORD` with your actual PostgreSQL password.

### Step 5: Setup Database Schema

```powershell
# Still in backend folder

# Generate Prisma Client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed initial data (creates admin user, disability types)
npx prisma db seed
```

Expected output:
```
✅ Masjid created: Masjid Al-Huda Padang Matsirat
✅ Admin user created: admin@masjidalhuda.my
✅ Imam user created: imam@masjidalhuda.my
✅ Staff user created: staff@masjidalhuda.my
✅ Disability types created: 9
```

### Step 6: Start Backend

```powershell
# Still in backend folder
npm run start:dev
```

Backend should start on `http://localhost:3001`

You should see:
```
🚀 Backend running on http://localhost:3001/api
```

### Step 7: Setup Frontend

Open a **new terminal window**:

```powershell
# Navigate to frontend folder
cd C:\Users\User\Desktop\Website\masjid\frontend

# Install dependencies
npm install

# Create .env.local file
# The file should already exist, but verify it has:
```

Create/edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 8: Start Frontend

```powershell
# Still in frontend folder
npm run dev
```

Frontend should start on `http://localhost:3000`

### Step 9: Test the Application

1. Open browser: `http://localhost:3000`
2. You should see the login page
3. Login with:
   - **Email:** `admin@masjidalhuda.my`
   - **Password:** `admin123`

4. Test features:
   - ✅ Dashboard loads with KPIs
   - ✅ Create new household (Borang Baru)
   - ✅ Search households (Senarai Isi Rumah)
   - ✅ View household details
   - ✅ Export reports (Laporan)

### Step 10: Verify Database

You can view the database using Prisma Studio:

```powershell
# In backend folder
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can view all tables and data.

---

## VPS Deployment

### Prerequisites

- **VPS with Ubuntu 22.04 LTS** (or similar)
- **Domain:** masjid.taskinsight.my (pointed to VPS IP)
- **SSH access** to VPS
- **Root or sudo access**

### Step 1: Connect to VPS

```bash
ssh root@YOUR_VPS_IP
# Or if using a user account:
ssh user@YOUR_VPS_IP
```

### Step 2: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 3: Install Required Software

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y

# Install Git
sudo apt install git -y

# Install PM2 (process manager)
sudo npm install -g pm2

# Verify installations
node --version  # Should show v18.x.x
npm --version
psql --version
nginx -v
```

### Step 4: Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE mkcs_db;

GRANT ALL PRIVILEGES ON DATABASE mkcs_db TO mkcs_user;
\q
```

**Important:** Replace `YOUR_SECURE_PASSWORD_HERE` with a strong password.

### Step 5: Clone Project

```bash
# Navigate to projects directory
cd /root/projects

# Clone your repository (or upload files)
# If using Git:
git clone <your-repo-url> masjid
cd masjid

# Or if uploading files manually, create directory:
# mkdir -p /root/projects/masjid
# Then upload all files to this directory
```

### Step 6: Setup Backend

```bash
cd /root/projects/masjid/backend

# Install dependencies
npm install

# Create production .env file
nano .env
```

Add to `backend/.env`:

```env
DATABASE_URL=postgresql://mkcs_user:YOUR_SECURE_PASSWORD_HERE@localhost:5432/mkcs_db
JWT_SECRET=your-super-secret-key-min-32-characters-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
```

**Important:** 
- Replace `YOUR_SECURE_PASSWORD_HERE` with the PostgreSQL password you created
- Change `JWT_SECRET` to a long random string (at least 32 characters)

Save and exit (Ctrl+X, then Y, then Enter)

### Step 7: Setup Database on VPS

```bash
# Still in backend folder

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data
npx prisma db seed
```

### Step 8: Build Backend

```bash
# Still in backend folder
npm run build
```

### Step 9: Setup Frontend

```bash
cd /root/projects/masjid/frontend

# Install dependencies
npm install

# Create production .env.local
nano .env.local
```

Add to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://masjid.taskinsight.my/api
```

Save and exit.

### Step 10: Build Frontend

```bash
# Still in frontend folder
npm run build
```

### Step 11: Setup PM2 for Backend

```bash
# Create PM2 ecosystem file
cd /root/projects/masjid/backend
nano ecosystem.config.js
```

Add:

```javascript
module.exports = {
  apps: [{
    name: 'mkcs-backend',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

Save and exit.

```bash
# Create logs directory
mkdir -p logs

# Start backend with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown
```

### Step 12: Setup PM2 for Frontend

```bash
cd /root/projects/masjid/frontend

# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add:

```javascript
module.exports = {
  apps: [{
    name: 'mkcs-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

Save and exit.

```bash
# Create logs directory
mkdir -p logs

# Start frontend with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

### Step 13: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/masjid.taskinsight.my
```

Add:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name masjid.taskinsight.my;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name masjid.taskinsight.my;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/masjid.taskinsight.my/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/masjid.taskinsight.my/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase timeouts for large requests
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

Save and exit.

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/masjid.taskinsight.my /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

### Step 14: Setup SSL Certificate

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d masjid.taskinsight.my

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 15: Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 16: Verify Deployment

1. **Check PM2 processes:**
   ```bash
   pm2 list
   pm2 logs
   ```

2. **Check Nginx:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Check PostgreSQL:**
   ```bash
   sudo systemctl status postgresql
   ```

4. **Test in browser:**
   - Open: `https://masjid.taskinsight.my`
   - Should see login page
   - Login with: `admin@masjidalhuda.my` / `admin123`

---

## Post-Deployment Configuration

### Change Default Passwords

**IMPORTANT:** Change all default passwords immediately!

1. **Change Admin Password:**
   - Login to the system
   - Go to User Management (if implemented)
   - Or update directly in database:

   ```bash
   cd /root/projects/masjid/backend
   npx prisma studio
   # Navigate to User table and update password hash
   ```

2. **Change PostgreSQL Password:**
   ```bash
   sudo -u postgres psql
   ALTER USER mkcs_user WITH PASSWORD 'NEW_SECURE_PASSWORD';
   \q
   ```
   Then update `backend/.env` with new password.

### Setup Automatic Backups

```bash
# Create backup script
nano /root/backup-mkcs.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/root/backups/mkcs"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U mkcs_user mkcs_db > $BACKUP_DIR/db_$DATE.sql

# Backup files (optional)
# tar -czf $BACKUP_DIR/files_$DATE.tar.gz /root/projects/masjid

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /root/backup-mkcs.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /root/backup-mkcs.sh >> /root/backup-mkcs.log 2>&1
```

### Monitor System

```bash
# Check PM2 status
pm2 status
pm2 monit

# Check logs
pm2 logs mkcs-backend
pm2 logs mkcs-frontend

# Check system resources
htop
# or
top
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs mkcs-backend

# Check if port is in use
netstat -tulpn | grep 3001

# Restart backend
pm2 restart mkcs-backend
```

### Frontend Not Loading

```bash
# Check logs
pm2 logs mkcs-frontend

# Check if port is in use
netstat -tulpn | grep 3000

# Restart frontend
pm2 restart mkcs-frontend
```

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U mkcs_user -d mkcs_db -h localhost

# Verify .env file
cat /root/projects/masjid/backend/.env | grep DATABASE_URL
```

### Nginx 502 Bad Gateway

```bash
# Check if backend/frontend are running
pm2 list

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Prisma Errors

```bash
cd /root/projects/masjid/backend

# Regenerate Prisma Client
npx prisma generate

# Reset database (⚠️ WARNING: Deletes all data)
# npx prisma migrate reset

# Run migrations
npx prisma migrate deploy
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3001
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### PM2 Commands

```bash
# List all processes
pm2 list

# Stop process
pm2 stop mkcs-backend
pm2 stop mkcs-frontend

# Restart process
pm2 restart mkcs-backend

# Delete process
pm2 delete mkcs-backend

# View logs
pm2 logs

# Monitor
pm2 monit

# Save current process list
pm2 save
```

---

## Useful Commands Reference

### Development (Local)

```powershell
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev

# Database
npx prisma studio
npx prisma migrate dev
npx prisma db seed
```

### Production (VPS)

```bash
# Backend
cd /root/projects/masjid/backend
pm2 restart mkcs-backend
pm2 logs mkcs-backend

# Frontend
cd /root/projects/masjid/frontend
pm2 restart mkcs-frontend
pm2 logs mkcs-frontend

# Database
cd /root/projects/masjid/backend
npx prisma studio  # Access at http://YOUR_VPS_IP:5555

# Nginx
sudo systemctl restart nginx
sudo nginx -t

# PostgreSQL
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Changed JWT_SECRET to strong random string
- [ ] Changed PostgreSQL password
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured (UFW)
- [ ] Regular backups scheduled
- [ ] PM2 auto-start on boot configured
- [ ] Nginx security headers enabled
- [ ] Database user has minimal privileges
- [ ] Environment variables secured (.env files not in Git)

---

## Support

For issues or questions:
1. Check logs: `pm2 logs`
2. Check Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Check database: `sudo systemctl status postgresql`
4. Review this guide's troubleshooting section

---

**Domain:** masjid.taskinsight.my  
**Project Path:** /root/projects/masjid  
**Last Updated:** January 2026
