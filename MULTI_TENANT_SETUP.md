# Multi-Tenant Setup Guide for i-masjid.my

This guide covers the infrastructure setup for the multi-tenant i-masjid.my platform.

## Phase 1: Infrastructure & DNS Setup

### 1.1 Cloudflare DNS Setup

1. **Login to Cloudflare** (or create account at https://cloudflare.com)

2. **Add Domain** (if not already added)
   - Add `i-masjid.my` to Cloudflare
   - Update nameservers at your domain registrar

3. **Create DNS Records**
   ```
   Type: A
   Name: @
   Content: YOUR_VPS_IP
   Proxy: ON (orange cloud)
   
   Type: A
   Name: *
   Content: YOUR_VPS_IP
   Proxy: ON (orange cloud)
   
   Type: A
   Name: www
   Content: YOUR_VPS_IP
   Proxy: ON (orange cloud)
   ```

4. **Create API Token for Certbot**
   - Go to: My Profile → API Tokens → Create Token
   - Use template: "Edit zone DNS"
   - Zone Resources: Include → Specific zone → i-masjid.my
   - Click "Continue to summary" → "Create Token"
   - **Save the token securely!**

### 1.2 SSL Certificate (Wildcard) with Let's Encrypt

**On your VPS, run these commands:**

```bash
# 1. Install certbot with Cloudflare plugin
sudo apt update
sudo apt install -y certbot python3-certbot-dns-cloudflare

# 2. Create Cloudflare credentials file
sudo mkdir -p /etc/letsencrypt
sudo nano /etc/letsencrypt/cloudflare.ini
```

**Add this content to cloudflare.ini:**
```ini
dns_cloudflare_api_token = YOUR_CLOUDFLARE_API_TOKEN_HERE
```

**Continue with these commands:**
```bash
# 3. Secure the credentials file
sudo chmod 600 /etc/letsencrypt/cloudflare.ini

# 4. Generate wildcard certificate
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d i-masjid.my \
  -d "*.i-masjid.my" \
  --preferred-challenges dns-01 \
  --agree-tos \
  --email your-email@example.com

# 5. Verify certificate was created
sudo ls -la /etc/letsencrypt/live/i-masjid.my/

# 6. Test auto-renewal
sudo certbot renew --dry-run
```

### 1.3 Nginx Configuration

**Create new Nginx config file:**
```bash
sudo nano /etc/nginx/sites-available/i-masjid.my
```

**Add this configuration:**
```nginx
# ============================================
# i-masjid.my Multi-Tenant Configuration
# ============================================

# Redirect HTTP to HTTPS for all domains
server {
    listen 80;
    listen [::]:80;
    server_name i-masjid.my *.i-masjid.my;
    return 301 https://$host$request_uri;
}

# Main domain - Master Admin Dashboard
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name i-masjid.my www.i-masjid.my;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/i-masjid.my/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/i-masjid.my/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Frontend - Next.js (Master Dashboard)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}

# Wildcard subdomains - Tenant Dashboards
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name *.i-masjid.my;

    # SSL Configuration (same wildcard cert)
    ssl_certificate /etc/letsencrypt/live/i-masjid.my/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/i-masjid.my/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;

    # Frontend - Next.js (Tenant Dashboard)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

**Enable the site:**
```bash
# Remove old config if exists
sudo rm -f /etc/nginx/sites-enabled/alhuda.i-masjid.my

# Enable new config
sudo ln -s /etc/nginx/sites-available/i-masjid.my /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 1.4 Verify Setup

```bash
# Test main domain
curl -I https://i-masjid.my

# Test wildcard subdomain
curl -I https://alhuda.i-masjid.my

# Test another subdomain (should also work with SSL)
curl -I https://test.i-masjid.my
```

---

## Quick Reference

### File Locations
- Cloudflare credentials: `/etc/letsencrypt/cloudflare.ini`
- SSL certificates: `/etc/letsencrypt/live/i-masjid.my/`
- Nginx config: `/etc/nginx/sites-available/i-masjid.my`

### Useful Commands
```bash
# Check SSL certificate expiry
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Check Nginx status
sudo systemctl status nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Certificate Auto-Renewal
Certbot automatically installs a systemd timer for renewal. Verify it's enabled:
```bash
sudo systemctl status certbot.timer
```

---

## Next Steps

After completing this infrastructure setup:
1. Run the database migration (Phase 2)
2. Deploy the updated backend (Phase 3)
3. Deploy the updated frontend (Phase 4)
4. Create initial master admin account
5. Migrate existing alhuda data (Phase 6)
