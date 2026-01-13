# Masjid Kariah Census System (MKCS)

Sistem Bancian Anak Kariah Masjid Al-Huda Padang Matsirat

## Overview

MKCS adalah sistem web dalaman untuk pengurusan masjid bagi:
- Memasukkan data borang bancian anak kariah secara digital
- Mengurus data isi rumah (household)
- Menjejak sejarah perubahan (versioning)
- Menjana analitik dan laporan

## Technology Stack

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, Prisma ORM
- **Database**: PostgreSQL 15
- **Authentication**: JWT

## Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose (recommended)
- PostgreSQL 15 (if not using Docker)

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api

### Manual Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with API URL
npm run dev
```

## Default Login

**Admin Account:**
- Email: `admin@masjidalhuda.my`
- Password: `admin123`

⚠️ **Change password after first login!**

## Project Structure

```
mkcs/
├── frontend/          # Next.js frontend
├── backend/           # NestJS backend
├── docker-compose.yml
└── README.md
```

## Documentation

- [Development Guide](DEVELOPMENT_GUIDE.md) - Complete technical specifications
- [TODO Checklist](TODO_CHECKLIST.md) - Development progress tracker
- [Quick Reference](QUICK_REFERENCE.md) - UI translations and API reference

## Features

✅ Staff authentication & role management  
✅ Digital household census form  
✅ Unlimited dependents support  
✅ IC duplicate detection  
✅ Dashboard with analytics  
✅ Search & filter households  
✅ Version history tracking  
✅ Export to Excel, CSV, PDF  

## Database Migrations

```bash
# Create new migration
cd backend
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# View database in GUI
npx prisma studio
```

## Support

Untuk sokongan atau isu, sila rujuk dokumentasi atau hubungi pentadbir sistem.

---

**Masjid Al-Huda Padang Matsirat**  
07100 Langkawi, Kedah Darul Aman
