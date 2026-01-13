# Quick Commands Reference

Quick reference for common commands during development and deployment.

---

## Local Development (Windows)

### Backend Setup
```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

### Database Management
```powershell
# View database in GUI
cd backend
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

---

## VPS Deployment

### Initial Setup
```bash
# Connect to VPS
ssh root@YOUR_VPS_IP

# Navigate to project
cd /root/projects/masjid

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run build
pm2 start ecosystem.config.js

# Frontend
cd ../frontend
npm install
npm run build
pm2 start ecosystem.config.js
```

### Daily Operations

#### Check Status
```bash
pm2 list
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
```

#### View Logs
```bash
pm2 logs mkcs-backend
pm2 logs mkcs-frontend
pm2 logs --lines 100
sudo tail -f /var/log/nginx/error.log
```

#### Restart Services
```bash
pm2 restart mkcs-backend
pm2 restart mkcs-frontend
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

#### Update Code
```bash
cd /root/projects/masjid

# Pull latest changes (if using Git)
git pull

# Backend
cd backend
npm install
npm run build
pm2 restart mkcs-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart mkcs-frontend
```

#### Database Updates
```bash
cd /root/projects/masjid/backend
npx prisma migrate deploy
npx prisma generate
pm2 restart mkcs-backend
```

---

## PM2 Commands

```bash
# List all processes
pm2 list

# Start process
pm2 start ecosystem.config.js

# Stop process
pm2 stop mkcs-backend

# Restart process
pm2 restart mkcs-backend

# Delete process
pm2 delete mkcs-backend

# View logs
pm2 logs
pm2 logs mkcs-backend --lines 50

# Monitor
pm2 monit

# Save configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

---

## Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## PostgreSQL Commands

```bash
# Connect to database
psql -U mkcs_user -d mkcs_db

# Backup database
pg_dump -U mkcs_user mkcs_db > backup.sql

# Restore database
psql -U mkcs_user -d mkcs_db < backup.sql

# Check status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## SSL Certificate

```bash
# Get certificate
sudo certbot --nginx -d masjid.taskinsight.my

# Renew certificate
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run

# Check certificates
sudo certbot certificates
```

---

## Firewall (UFW)

```bash
# Check status
sudo ufw status

# Allow ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Disable firewall
sudo ufw disable
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process
sudo lsof -i :3001
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Check Service Status
```bash
# All services
pm2 list
sudo systemctl status nginx
sudo systemctl status postgresql

# Check ports
netstat -tulpn | grep 3001
netstat -tulpn | grep 3000
```

### View All Logs
```bash
# Application logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
journalctl -xe
```

---

## Backup & Restore

### Backup Database
```bash
pg_dump -U mkcs_user mkcs_db > /root/backups/mkcs_$(date +%Y%m%d).sql
```

### Restore Database
```bash
psql -U mkcs_user mkcs_db < /root/backups/mkcs_20260113.sql
```

### Backup Files
```bash
tar -czf /root/backups/masjid_files_$(date +%Y%m%d).tar.gz /root/projects/masjid
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://mkcs_user:PASSWORD@localhost:5432/mkcs_db
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://masjid.taskinsight.my/api
```

---

## Quick Health Check

```bash
# Run all checks
echo "=== PM2 Status ==="
pm2 list

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager

echo "=== PostgreSQL Status ==="
sudo systemctl status postgresql --no-pager

echo "=== Disk Space ==="
df -h

echo "=== Memory Usage ==="
free -h

echo "=== Recent Logs ==="
pm2 logs --lines 10 --nostream
```

---

**Domain:** masjid.taskinsight.my  
**Project:** /root/projects/masjid
