# Local Multi-Tenant Testing Guide

This guide explains how to test the multi-tenant functionality locally without needing to set up subdomains.

## Quick Start

### 1. Test Main Domain (Landing Page)
Visit: **http://localhost:3000**
- Shows the marketing landing page
- No tenant context

### 2. Test Tenant Subdomain (Public Dashboard)
Visit: **http://localhost:3000?tenant=alhuda**
- Shows the tenant-specific public dashboard
- Fetches branding from backend
- Uses tenant-specific colors and logo

## How It Works

### Frontend
- Uses `?tenant=SLUG` query parameter to simulate subdomain
- Example: `?tenant=alhuda` simulates `alhuda.i-masjid.my`
- Automatically sends `X-Tenant-Slug` header to backend

### Backend
- Checks `X-Tenant-Slug` header when request comes from localhost
- Resolves tenant from database using the slug
- Attaches tenant context to request

## Testing Different Tenants

1. **Al-Huda Tenant:**
   ```
   http://localhost:3000?tenant=alhuda
   http://localhost:3000/umum?tenant=alhuda
   ```

2. **Another Tenant (if exists):**
   ```
   http://localhost:3000?tenant=YOUR_TENANT_SLUG
   http://localhost:3000/umum?tenant=YOUR_TENANT_SLUG
   ```

3. **Main Domain (no tenant):**
   ```
   http://localhost:3000
   ```

## Master Admin Credentials

**Email:** `admin@i-masjid.my`  
**Password:** `admin123`

**Login URL:** http://localhost:3000/master/login

⚠️ **Note:** Change this password in production! See `MASTER_ADMIN_CREDENTIALS.md` for details.

## Testing Checklist

- [ ] Main domain shows landing page
- [ ] `?tenant=alhuda` shows tenant dashboard
- [ ] Tenant branding (logo, colors) loads correctly
- [ ] Backend resolves tenant from header
- [ ] Analytics data is tenant-specific
- [ ] Master admin login works
- [ ] Tenant admin login works

## Troubleshooting

### Tenant not found
- Make sure tenant exists in database with slug matching query param
- Check backend logs for tenant resolution errors
- Verify `X-Tenant-Slug` header is being sent (check Network tab)

### Branding not loading
- Check browser console for API errors
- Verify `/api/analytics/public/tenant-info` endpoint works
- Ensure tenant has branding data (logo, colors) in database

### Backend not resolving tenant
- Check `X-Tenant-Slug` header in request
- Verify tenant middleware is running
- Check backend logs for tenant resolution

## Production vs Local

| Feature | Production | Local Testing |
|---------|-----------|---------------|
| Subdomain | `alhuda.i-masjid.my` | `localhost:3000?tenant=alhuda` |
| Detection | Hostname parsing | Query parameter |
| Header | Automatic | `X-Tenant-Slug` header |

## Next Steps

Once you've tested locally, you can:
1. Set up actual subdomains for production
2. Configure Nginx to route subdomains
3. Set up DNS records
4. Deploy to production

See `MULTI_TENANT_DEPLOYMENT.md` for production deployment instructions.
