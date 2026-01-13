# Quick Start Guide - MKCS

## 🚀 Setup Menggunakan Docker (Paling Mudah)

### Prasyarat
- Docker dan Docker Compose terpasang
- Port 3000, 3001, dan 5432 tersedia

### Langkah-langkah:

1. **Clone/Download Projek**
```bash
cd c:\Users\User\Desktop\Website\masjid
```

2. **Setup Database & Backend**
```bash
# Generate Prisma Client
cd backend
npx prisma generate

# Jalankan migrations (buat tables)
npx prisma migrate dev --name init

# Seed data awal (admin user, disability types)
npx prisma db seed
```

3. **Jalankan Semua Services**
```bash
# Kembali ke root folder
cd ..

# Start semua services (Postgres, Backend, Frontend)
docker-compose up -d
```

4. **Akses Aplikasi**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

### Login Akaun Lalai
```
Email: admin@masjidalhuda.my
Password: admin123
```

⚠️ **Sila tukar kata laluan selepas login pertama!**

---

## 📝 Setup Manual (Tanpa Docker)

### Prasyarat
- Node.js 18+
- PostgreSQL 15+

### 1. Setup Database

```bash
# Install PostgreSQL dan buat database
createdb mkcs_db

# Or menggunakan pgAdmin/psql
CREATE DATABASE mkcs_db;
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/mkcs_db
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed data
npx prisma db seed

# Start backend
npm run start:dev
```

Backend akan berjalan di `http://localhost:3001/api`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Start frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

---

## 🧪 Testing API

### Test Backend
```bash
# Test health check
curl http://localhost:3001/api

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@masjidalhuda.my","password":"admin123"}'
```

---

## 🛠️ Commands Berguna

### Database Commands
```bash
cd backend

# View database dalam GUI
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ DANGER - deletes all data)
npx prisma migrate reset

# Seed data only
npx prisma db seed
```

### Docker Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build
```

---

## 📊 Development Status

✅ **COMPLETED:**
- Phase 1: Project setup (Docker, Next.js, NestJS, PostgreSQL)
- Phase 2: Authentication system (Login, JWT, User management)

🔄 **IN PROGRESS:**
- Phase 3: Household form submission
- Phase 4: Dashboard with analytics
- Phase 5: Search and household management
- Phase 6: Export functionality

---

## 🐛 Troubleshooting

### Backend tidak start
```bash
# Check if port 3001 is used
netstat -ano | findstr :3001

# Check logs
cd backend
npm run start:dev
```

### Frontend tidak connect ke backend
```bash
# Check CORS settings in backend/src/main.ts
# Check .env.local in frontend
```

### Database connection error
```bash
# Check if PostgreSQL is running
# Check DATABASE_URL in backend/.env
# Check if database exists
```

### Prisma Client error
```bash
cd backend
npx prisma generate
```

---

## 📞 Sokongan

Rujuk dokumentasi lengkap:
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Full technical guide
- [TODO_CHECKLIST.md](TODO_CHECKLIST.md) - Development progress
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - API & UI reference

---

**Masjid Al-Huda Padang Matsirat**  
Sistem Bancian Anak Kariah
