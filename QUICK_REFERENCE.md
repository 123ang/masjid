# MKCS Quick Reference Card

## Project Commands

### Development
```bash
# Start all services
cd mkcs
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Frontend only (without Docker)
cd frontend
npm run dev

# Backend only (without Docker)
cd backend
npm run start:dev

# Database migrations
cd backend
npx prisma migrate dev --name <migration_name>
npx prisma db seed
npx prisma studio  # GUI for database
```

### Production
```bash
# Deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Migrations
docker-compose exec backend npx prisma migrate deploy
```

---

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (.env)
```env
DATABASE_URL=postgresql://mkcs:mkcs_password@localhost:5432/mkcs_db
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
```

---

## UI Text Reference (Bahasa Melayu)

### Navigation Menu
| English | Bahasa Melayu |
|---------|---------------|
| Dashboard | Papan Pemuka |
| New Form | Borang Baru |
| Household List | Senarai Isi Rumah |
| Reports | Laporan |
| User Management | Pengurusan Pengguna |
| Logout | Log Keluar |
| Profile | Profil |

### Form Labels - Section A (Applicant)
| English | Bahasa Melayu |
|---------|---------------|
| Name | Nama |
| IC Number | No. Kad Pengenalan |
| Current Address | Alamat Semasa |
| Phone Number | No. Telefon |
| Net Income (RM) | Pendapatan Bersih (RM) |
| Housing Status | Status Kediaman |
| Own | Sendiri |
| Rent | Sewa |

### Form Labels - Section B (Dependents)
| English | Bahasa Melayu |
|---------|---------------|
| Dependents List | Senarai Tanggungan |
| Add Dependent | Tambah Tanggungan |
| Dependent Name | Nama Tanggungan |
| Relationship | Hubungan |
| Occupation | Pekerjaan |
| Number of Dependents | Jumlah Tanggungan |

### Form Labels - Section C (Assistance)
| English | Bahasa Melayu |
|---------|---------------|
| Monthly Assistance | Bantuan Bulanan |
| Do you receive regular assistance? | Adakah menerima bantuan berkala? |
| Yes | Ya |
| No | Tidak |
| Name of assistance provider | Nama badan yang memberi bantuan |

### Form Labels - Section D (Disability)
| English | Bahasa Melayu |
|---------|---------------|
| Disability / Chronic Illness | OKU / Penyakit Kekal |
| Is there a disabled family member? | Adakah ada ahli keluarga OKU? |
| Type of disability | Jenis Masalah |
| Add disability member | Tambah Ahli OKU |

### Form Labels - Section E (Emergency Contact)
| English | Bahasa Melayu |
|---------|---------------|
| Emergency Contact | Penama Kedua (Untuk Dihubungi) |
| Add Contact | Tambah Penama |

### Action Buttons
| English | Bahasa Melayu |
|---------|---------------|
| Save | Simpan |
| Cancel | Batal |
| Update | Kemaskini |
| Delete | Padam |
| Edit | Sunting |
| View | Lihat |
| Search | Cari |
| Filter | Tapis |
| Export | Eksport |
| Download | Muat Turun |
| Back | Kembali |
| Next | Seterusnya |
| Previous | Sebelumnya |

### Dashboard Labels
| English | Bahasa Melayu |
|---------|---------------|
| Total Households | Jumlah Isi Rumah |
| Average Family Size | Purata Ahli Keluarga |
| Own House Families | Keluarga Rumah Sendiri |
| Rent House Families | Keluarga Rumah Sewa |
| Aid Recipients | Penerima Bantuan |
| Families with Disabled | Keluarga dengan OKU |
| Income Distribution | Taburan Pendapatan |
| Recent Submissions | Pendaftaran Terkini |
| Low Income | Pendapatan Rendah |
| Medium Income | Pendapatan Sederhana |
| High Income | Pendapatan Tinggi |

### Table Headers
| English | Bahasa Melayu |
|---------|---------------|
| Name | Nama |
| IC Number | No. K/P |
| Phone | No. Tel |
| Address | Alamat |
| Income | Pendapatan |
| Status | Status |
| Dependents | Tanggungan |
| Actions | Tindakan |
| Date | Tarikh |
| Version | Versi |
| Created By | Dicipta Oleh |

### Messages
| English | Bahasa Melayu |
|---------|---------------|
| Successfully saved | Berjaya disimpan |
| Error occurred | Ralat berlaku |
| IC already exists | No. K/P sudah wujud dalam sistem |
| Please fill required fields | Sila isi maklumat yang diperlukan |
| No records found | Tiada rekod dijumpai |
| Loading... | Memuatkan... |
| Are you sure? | Adakah anda pasti? |
| Confirm | Sahkan |
| Version created | Versi baru dicipta |
| Download started | Muat turun dimulakan |

### User Management
| English | Bahasa Melayu |
|---------|---------------|
| Add User | Tambah Pengguna |
| Edit User | Sunting Pengguna |
| Deactivate | Nyahaktif |
| Activate | Aktifkan |
| Role | Peranan |
| Active | Aktif |
| Inactive | Tidak Aktif |
| Admin | Pentadbir |
| Imam | Imam |
| Staff | Pengurusan |

### Login Page
| English | Bahasa Melayu |
|---------|---------------|
| Login | Log Masuk |
| Email | E-mel |
| Password | Kata Laluan |
| Invalid credentials | E-mel atau kata laluan tidak sah |
| Remember me | Ingat saya |

---

## Relationship Values (Hubungan)
```
Isteri
Suami
Anak
Anak Lelaki
Anak Perempuan
Ibu
Bapa
Adik
Abang
Kakak
Datuk
Nenek
Cucu
Ipar
Mertua
Anak Angkat
Saudara
Lain-lain
```

## Occupation Values (Pekerjaan)
```
Bekerja Sendiri
Kakitangan Kerajaan
Kakitangan Swasta
Pesara
Suri Rumah
Pelajar
Tidak Bekerja
Petani
Nelayan
Peniaga
Buruh
Pemandu
Guru
Doktor
Jurutera
Lain-lain
```

## Disability Types (Jenis OKU)
```
Lumpuh
Kanak-kanak Istimewa (OKU Pembelajaran)
Hilang Upaya Kekal
Masalah Penglihatan
Masalah Pendengaran
Masalah Pertuturan
Penyakit Kronik
Masalah Mental
Lain-lain
```

---

## API Quick Reference

### Authentication
```
POST /api/auth/login
  Body: { email, password }
  Response: { accessToken, refreshToken, user }

POST /api/auth/refresh
  Body: { refreshToken }
  Response: { accessToken, refreshToken }

GET /api/auth/me
  Header: Authorization: Bearer <token>
  Response: { user }
```

### Household
```
POST /api/household
  Body: { applicantName, icNo, phone, address, netIncome, housingStatus, ... }
  Response: { household }

GET /api/household
  Query: ?search=&housingStatus=&incomeMin=&incomeMax=&page=&limit=
  Response: { data, total, page, totalPages }

GET /api/household/:id
  Response: { household with all relations }

PUT /api/household/:id
  Body: { ...updated fields }
  Response: { household with new version }

GET /api/household/:id/versions
  Response: { versions[] }

GET /api/household/check-ic/:icNo
  Response: { exists: boolean, householdId?: string }
```

### Analytics
```
GET /api/analytics/summary
  Response: { totalHouseholds, totalDependents, averageHouseholdSize, ... }

GET /api/analytics/income-distribution
  Response: [{ range, count }]

GET /api/analytics/housing-status
  Response: { own, rent }
```

### Export
```
GET /api/export/excel
  Response: Excel file download

GET /api/export/csv
  Response: CSV file download

GET /api/export/pdf/:householdId
  Response: PDF file download
```

### Users (Admin only)
```
GET /api/user
POST /api/user
PUT /api/user/:id
DELETE /api/user/:id
```

---

## Color Palette (Suggested)

```css
/* Primary - Green (Islamic theme) */
--primary-50: #ecfdf5;
--primary-100: #d1fae5;
--primary-200: #a7f3d0;
--primary-300: #6ee7b7;
--primary-400: #34d399;
--primary-500: #10b981;
--primary-600: #059669;
--primary-700: #047857;
--primary-800: #065f46;
--primary-900: #064e3b;

/* Accent - Gold */
--accent-500: #f59e0b;
--accent-600: #d97706;

/* Neutral */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;

/* Status */
--success: #10b981;
--error: #ef4444;
--warning: #f59e0b;
--info: #3b82f6;
```

---

## File Naming Conventions

```
Components: PascalCase (HouseholdForm.tsx)
Pages: lowercase with dashes (page.tsx in folder)
Utilities: camelCase (formatDate.ts)
Types: PascalCase (Household.ts)
API routes: lowercase (household.controller.ts)
CSS modules: camelCase (householdForm.module.css)
```

---

## Testing Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@masjidalhuda.my | admin123 |
| Imam | imam@masjidalhuda.my | imam123 |
| Staff | staff@masjidalhuda.my | staff123 |

**⚠️ Change all passwords before production deployment!**

---

## Port Reference

| Service | Development | Production |
|---------|-------------|------------|
| Frontend | 3000 | 3000 |
| Backend | 3001 | 3001 |
| PostgreSQL | 5432 | 5432 |
| Nginx | - | 80/443 |
