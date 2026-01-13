# Masjid Kariah Census System (MKCS) - Development Guide

## Document Information
- **Version**: 1.0
- **Created**: January 2026
- **Purpose**: Step-by-step guide for AI agent to develop the complete system

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Requirements Summary](#2-requirements-summary)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [API Endpoints](#6-api-endpoints)
7. [UI Pages & Components](#7-ui-pages--components)
8. [Development Phases](#8-development-phases)
9. [Deployment Guide](#9-deployment-guide)
10. [Testing Checklist](#10-testing-checklist)

---

## 1. Project Overview

### 1.1 System Description
Masjid Kariah Census System (MKCS) adalah sistem web dalaman untuk pengurusan masjid bagi:
- Memasukkan data borang bancian anak kariah secara digital
- Mengurus data isi rumah (household)
- Menjejak sejarah perubahan (versioning)
- Menjana analitik dan laporan

### 1.2 Key Features
- ✅ Form submission (staff enters data from paper forms)
- ✅ Dashboard with statistics and charts
- ✅ Household search and management
- ✅ Export to PDF and Excel
- ✅ Version history for each household
- ✅ Multi-masjid ready architecture

### 1.3 Form Fields (Borang Bancian Anak Kariah)
Based on paper form from Masjid Al-Huda Padang Matsirat:

**Section A: Maklumat Pemohon (Applicant Info)**
- Nama (Name)
- No. Kad Pengenalan (IC Number) - UNIQUE, used for duplicate detection
- Alamat Semasa (Current Address)
- No. Telefon (Phone)
- Pendapatan Bersih (Net Income) - in RM
- Jumlah Tanggungan (Number of Dependents) - auto-calculated
- Status Kediaman (Housing Status) - Sendiri/Sewa (Own/Rent)

**Section B: Senarai Tanggungan (Dependents List)**
- Nama Tanggungan (Dependent Name)
- No. K/P (IC Number)
- No. Tel (Phone - optional)
- Hubungan (Relationship)
- Pekerjaan (Occupation)

**Section C: Bantuan Bulanan (Monthly Assistance)**
- Adakah menerima bantuan? (Yes/No)
- Nama badan yang memberi bantuan (Provider name if Yes)

**Section D: OKU/Penyakit Kekal (Disability/Chronic Illness)**
- Adakah ada ahli keluarga OKU? (Yes/No)
- Senarai ahli OKU dengan jenis masalah

**Section E: Penama Kedua (Emergency Contact)**
- Nama
- No. K/P
- No. Tel
- Hubungan

---

## 2. Requirements Summary

### 2.1 Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Staff can login with email/password | High |
| FR-02 | Staff can create new household record | High |
| FR-03 | Staff can add unlimited dependents | High |
| FR-04 | System detects duplicate IC numbers | High |
| FR-05 | Staff can search households | High |
| FR-06 | Staff can view/edit household details | High |
| FR-07 | Edit creates new version (history preserved) | High |
| FR-08 | Dashboard shows KPI statistics | High |
| FR-09 | Export to Excel/CSV | High |
| FR-10 | Export to PDF (paper form layout) | High |
| FR-11 | Admin can manage users | Medium |
| FR-12 | View version history | Medium |

### 2.2 Non-Functional Requirements
| ID | Requirement |
|----|-------------|
| NFR-01 | Language: Bahasa Melayu only |
| NFR-02 | Mobile responsive design |
| NFR-03 | All form fields optional (except IC for duplicate check) |
| NFR-04 | Multi-masjid ready database design |
| NFR-05 | JWT authentication |
| NFR-06 | Dockerized deployment |

---

## 3. Technology Stack

### 3.1 Frontend
```
Framework: Next.js 14 (App Router)
Styling: Tailwind CSS
UI Components: shadcn/ui
Icons: Lucide React
Charts: Recharts
Forms: React Hook Form + Zod
HTTP Client: Axios
State: React Context (simple) or Zustand (if needed)
```

### 3.2 Backend
```
Framework: NestJS
ORM: Prisma
Authentication: JWT (passport-jwt)
Validation: class-validator
Documentation: Swagger (optional)
```

### 3.3 Database
```
Database: PostgreSQL 15+
```

### 3.4 DevOps
```
Containerization: Docker + Docker Compose
Reverse Proxy: Nginx
SSL: Let's Encrypt (certbot)
```

---

## 4. Project Structure

### 4.1 Monorepo Structure
```
mkcs/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── README.md
│
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── .env.local.example
│   │
│   ├── public/
│   │   ├── logo.png
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (redirect to /login or /dashboard)
│   │   │   │
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx (sidebar layout)
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── borang/
│   │   │   │   │   ├── page.tsx (form list or new form)
│   │   │   │   │   └── baru/
│   │   │   │   │       └── page.tsx (new form entry)
│   │   │   │   ├── isi-rumah/
│   │   │   │   │   ├── page.tsx (household list)
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx (household detail)
│   │   │   │   ├── laporan/
│   │   │   │   │   └── page.tsx (reports & export)
│   │   │   │   └── pengguna/
│   │   │   │       └── page.tsx (user management - admin only)
│   │   │   │
│   │   │   └── api/ (if needed for BFF)
│   │   │
│   │   ├── components/
│   │   │   ├── ui/ (shadcn components)
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   ├── forms/
│   │   │   │   ├── HouseholdForm.tsx
│   │   │   │   ├── DependentFields.tsx
│   │   │   │   ├── DisabilityFields.tsx
│   │   │   │   └── EmergencyContactFields.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── IncomeChart.tsx
│   │   │   │   ├── HousingChart.tsx
│   │   │   │   └── RecentSubmissions.tsx
│   │   │   └── household/
│   │   │       ├── HouseholdTable.tsx
│   │   │       ├── HouseholdDetail.tsx
│   │   │       └── VersionHistory.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts (axios instance)
│   │   │   ├── auth.ts (auth helpers)
│   │   │   └── utils.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useHouseholds.ts
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   │
│   │   └── types/
│   │       └── index.ts
│   │
│   └── Dockerfile
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env.example
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   │
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   │
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   └── roles.decorator.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   └── filters/
│   │   │       └── http-exception.filter.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   │
│   │   ├── user/
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── masjid/
│   │   │   ├── masjid.module.ts
│   │   │   ├── masjid.controller.ts
│   │   │   ├── masjid.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── household/
│   │   │   ├── household.module.ts
│   │   │   ├── household.controller.ts
│   │   │   ├── household.service.ts
│   │   │   └── dto/
│   │   │       ├── create-household.dto.ts
│   │   │       └── update-household.dto.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── analytics.module.ts
│   │   │   ├── analytics.controller.ts
│   │   │   └── analytics.service.ts
│   │   │
│   │   ├── export/
│   │   │   ├── export.module.ts
│   │   │   ├── export.controller.ts
│   │   │   └── export.service.ts
│   │   │
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   │
│   └── Dockerfile
│
└── nginx/
    ├── nginx.conf
    └── Dockerfile
```

---

## 5. Database Schema

### 5.1 Prisma Schema (prisma/schema.prisma)

```prisma
// This is the Prisma schema file for MKCS

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  ADMIN
  IMAM
  PENGURUSAN
}

enum HousingStatus {
  SENDIRI  // Own
  SEWA     // Rent
}

// ============================================
// MASJID (Tenant - Multi-masjid support)
// ============================================

model Masjid {
  id        String   @id @default(cuid())
  name      String
  address   String?
  phone     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users      User[]
  households Household[]

  @@map("masjid")
}

// ============================================
// USER (Staff accounts)
// ============================================

model User {
  id           String   @id @default(cuid())
  masjidId     String   @map("masjid_id")
  name         String
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         UserRole @default(PENGURUSAN)
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  masjid            Masjid             @relation(fields: [masjidId], references: [id])
  householdVersions HouseholdVersion[] @relation("CreatedByUser")
  submissions       Submission[]       @relation("ReceivedByUser")

  @@map("user")
}

// ============================================
// HOUSEHOLD (Stable identity)
// ============================================

model Household {
  id               String   @id @default(cuid())
  masjidId         String   @map("masjid_id")
  currentVersionId String?  @unique @map("current_version_id")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  masjid         Masjid            @relation(fields: [masjidId], references: [id])
  currentVersion HouseholdVersion? @relation("CurrentVersion", fields: [currentVersionId], references: [id])
  versions       HouseholdVersion[] @relation("HouseholdVersions")
  submissions    Submission[]

  @@map("household")
}

// ============================================
// HOUSEHOLD VERSION (Snapshot history)
// ============================================

model HouseholdVersion {
  id              String   @id @default(cuid())
  householdId     String   @map("household_id")
  versionNo       Int      @map("version_no")
  createdByUserId String   @map("created_by_user_id")
  createdAt       DateTime @default(now()) @map("created_at")

  // Section A: Applicant Info
  applicantName   String?  @map("applicant_name")
  icNo            String?  @map("ic_no")
  phone           String?
  address         String?
  netIncome       Decimal? @map("net_income") @db.Decimal(10, 2)
  housingStatus   HousingStatus? @map("housing_status")

  // Section C: Monthly Assistance
  assistanceReceived    Boolean @default(false) @map("assistance_received")
  assistanceProviderText String? @map("assistance_provider_text")

  // Section D: Disability (flag only, details in related table)
  disabilityInFamily    Boolean @default(false) @map("disability_in_family")
  disabilityNotesText   String? @map("disability_notes_text")

  // Relations
  household          Household  @relation("HouseholdVersions", fields: [householdId], references: [id])
  currentOfHousehold Household? @relation("CurrentVersion")
  createdByUser      User       @relation("CreatedByUser", fields: [createdByUserId], references: [id])
  dependents         HouseholdVersionDependent[]
  disabilityMembers  HouseholdVersionDisabilityMember[]
  emergencyContacts  HouseholdVersionEmergencyContact[]

  @@unique([householdId, versionNo])
  @@map("household_version")
}

// ============================================
// PERSON (Reusable for dependents)
// ============================================

model Person {
  id        String   @id @default(cuid())
  fullName  String   @map("full_name")
  icNo      String?  @map("ic_no")
  phone     String?
  createdAt DateTime @default(now()) @map("created_at")

  dependentOf       HouseholdVersionDependent[]
  disabilityRecords HouseholdVersionDisabilityMember[]

  @@map("person")
}

// ============================================
// HOUSEHOLD VERSION DEPENDENT
// ============================================

model HouseholdVersionDependent {
  id                 String @id @default(cuid())
  householdVersionId String @map("household_version_id")
  personId           String @map("person_id")
  relationship       String? // Hubungan: Isteri, Anak, Ibu, Bapa, etc.
  occupation         String? // Pekerjaan

  householdVersion HouseholdVersion @relation(fields: [householdVersionId], references: [id], onDelete: Cascade)
  person           Person           @relation(fields: [personId], references: [id])

  @@map("household_version_dependent")
}

// ============================================
// DISABILITY TYPE (Predefined list)
// ============================================

model DisabilityType {
  id   String @id @default(cuid())
  name String @unique

  members HouseholdVersionDisabilityMember[]

  @@map("disability_type")
}

// ============================================
// HOUSEHOLD VERSION DISABILITY MEMBER
// ============================================

model HouseholdVersionDisabilityMember {
  id                 String  @id @default(cuid())
  householdVersionId String  @map("household_version_id")
  personId           String  @map("person_id")
  disabilityTypeId   String? @map("disability_type_id")
  notesText          String? @map("notes_text")

  householdVersion HouseholdVersion @relation(fields: [householdVersionId], references: [id], onDelete: Cascade)
  person           Person           @relation(fields: [personId], references: [id])
  disabilityType   DisabilityType?  @relation(fields: [disabilityTypeId], references: [id])

  @@map("household_version_disability_member")
}

// ============================================
// HOUSEHOLD VERSION EMERGENCY CONTACT
// ============================================

model HouseholdVersionEmergencyContact {
  id                 String @id @default(cuid())
  householdVersionId String @map("household_version_id")
  name               String
  icNo               String? @map("ic_no")
  phone              String?
  relationship       String?

  householdVersion HouseholdVersion @relation(fields: [householdVersionId], references: [id], onDelete: Cascade)

  @@map("household_version_emergency_contact")
}

// ============================================
// SUBMISSION (Paper form tracking)
// ============================================

model Submission {
  id               String   @id @default(cuid())
  householdId      String   @map("household_id")
  receivedDate     DateTime @map("received_date")
  receivedByUserId String   @map("received_by_user_id")
  notes            String?
  createdAt        DateTime @default(now()) @map("created_at")

  household    Household @relation(fields: [householdId], references: [id])
  receivedByUser User     @relation("ReceivedByUser", fields: [receivedByUserId], references: [id])

  @@map("submission")
}
```

### 5.2 Seed Data (prisma/seed.ts)

```typescript
// Seed data for initial setup
// Creates:
// 1. Masjid Al-Huda Padang Matsirat
// 2. Admin user
// 3. Disability types

const seedData = {
  masjid: {
    name: "Masjid Al-Huda Padang Matsirat",
    address: "07100 Langkawi, Kedah Darul Aman",
    phone: ""
  },
  adminUser: {
    name: "Admin",
    email: "admin@masjidalhuda.my",
    password: "admin123", // Change in production!
    role: "ADMIN"
  },
  disabilityTypes: [
    "Lumpuh",
    "Kanak-kanak Istimewa (OKU Pembelajaran)",
    "Hilang Upaya Kekal",
    "Masalah Penglihatan",
    "Masalah Pendengaran",
    "Masalah Pertuturan",
    "Penyakit Kronik",
    "Lain-lain"
  ]
};
```

---

## 6. API Endpoints

### 6.1 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/refresh` | Refresh access token | Yes |
| POST | `/api/auth/logout` | Logout (invalidate token) | Yes |
| GET | `/api/auth/me` | Get current user info | Yes |

**Login Request:**
```json
{
  "email": "admin@masjidalhuda.my",
  "password": "admin123"
}
```

**Login Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@masjidalhuda.my",
    "role": "ADMIN",
    "masjid": {
      "id": "...",
      "name": "Masjid Al-Huda Padang Matsirat"
    }
  }
}
```

### 6.2 Household

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/household` | Create new household | Yes |
| GET | `/api/household` | List households (with search/filter) | Yes |
| GET | `/api/household/:id` | Get household detail | Yes |
| PUT | `/api/household/:id` | Update household (creates new version) | Yes |
| GET | `/api/household/:id/versions` | Get version history | Yes |
| GET | `/api/household/check-ic/:icNo` | Check if IC exists | Yes |

**Create Household Request:**
```json
{
  "applicantName": "Ahmad bin Abdullah",
  "icNo": "780515015234",
  "phone": "0124567890",
  "address": "No 123, Kampung Padang Matsirat, 07100 Langkawi",
  "netIncome": 1500.00,
  "housingStatus": "SENDIRI",
  "assistanceReceived": true,
  "assistanceProviderText": "Jabatan Kebajikan Masyarakat",
  "disabilityInFamily": false,
  "disabilityNotesText": null,
  "dependents": [
    {
      "fullName": "Aminah binti Ahmad",
      "icNo": "850620015678",
      "phone": "0134567890",
      "relationship": "Isteri",
      "occupation": "Suri Rumah"
    },
    {
      "fullName": "Muhammad bin Ahmad",
      "icNo": "100505011234",
      "phone": null,
      "relationship": "Anak",
      "occupation": "Pelajar"
    }
  ],
  "disabilityMembers": [],
  "emergencyContacts": [
    {
      "name": "Abu bin Abdullah",
      "icNo": "750101015432",
      "phone": "0145678901",
      "relationship": "Abang"
    }
  ]
}
```

**List Households Query Params:**
```
GET /api/household?search=ahmad&housingStatus=SENDIRI&incomeMin=0&incomeMax=2000&page=1&limit=20
```

### 6.3 Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/summary` | Get KPI summary | Yes |
| GET | `/api/analytics/income-distribution` | Get income distribution | Yes |
| GET | `/api/analytics/housing-status` | Get housing status breakdown | Yes |
| GET | `/api/analytics/assistance-stats` | Get assistance statistics | Yes |
| GET | `/api/analytics/disability-stats` | Get disability statistics | Yes |

**Summary Response:**
```json
{
  "totalHouseholds": 150,
  "totalDependents": 423,
  "averageHouseholdSize": 3.82,
  "totalOwnHouse": 95,
  "totalRentHouse": 55,
  "totalReceivingAssistance": 32,
  "totalWithDisability": 18,
  "averageIncome": 1850.50,
  "householdsThisMonth": 12,
  "staleRecords": 8
}
```

### 6.4 Export

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/export/excel` | Export all households to Excel | Yes |
| GET | `/api/export/csv` | Export all households to CSV | Yes |
| GET | `/api/export/pdf/:householdId` | Export single household to PDF | Yes |
| GET | `/api/export/pdf/summary` | Export summary report to PDF | Yes |

### 6.5 User Management (Admin only)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/user` | List all users | Yes | ADMIN |
| POST | `/api/user` | Create new user | Yes | ADMIN |
| PUT | `/api/user/:id` | Update user | Yes | ADMIN |
| DELETE | `/api/user/:id` | Deactivate user | Yes | ADMIN |

---

## 7. UI Pages & Components

### 7.1 Pages Overview

| Route | Page | Description | Access |
|-------|------|-------------|--------|
| `/login` | Login | Staff login page | Public |
| `/dashboard` | Dashboard | KPI cards and charts | All staff |
| `/borang/baru` | New Form | Create new household form | All staff |
| `/isi-rumah` | Household List | Search and list households | All staff |
| `/isi-rumah/[id]` | Household Detail | View/edit household | All staff |
| `/laporan` | Reports | Export reports | All staff |
| `/pengguna` | User Management | Manage staff accounts | ADMIN only |

### 7.2 UI Text (Bahasa Melayu)

All UI text must be in Bahasa Melayu. Here are the standard labels:

**Navigation:**
```
Dashboard = Papan Pemuka
Borang Baru = Borang Baru
Senarai Isi Rumah = Senarai Isi Rumah
Laporan = Laporan
Pengurusan Pengguna = Pengurusan Pengguna
Log Keluar = Log Keluar
```

**Form Labels:**
```
Nama = Nama
No. Kad Pengenalan = No. Kad Pengenalan
Alamat Semasa = Alamat Semasa
No. Telefon = No. Telefon
Pendapatan Bersih (RM) = Pendapatan Bersih (RM)
Status Kediaman = Status Kediaman
Sendiri = Sendiri
Sewa = Sewa

Senarai Tanggungan = Senarai Tanggungan
Tambah Tanggungan = Tambah Tanggungan
Hubungan = Hubungan
Pekerjaan = Pekerjaan

Bantuan Bulanan = Bantuan Bulanan
Adakah menerima bantuan berkala? = Adakah menerima bantuan berkala?
Ya = Ya
Tidak = Tidak
Nama badan yang memberi bantuan = Nama badan yang memberi bantuan

OKU / Penyakit Kekal = OKU / Penyakit Kekal
Adakah ada ahli keluarga OKU? = Adakah ada ahli keluarga OKU?
Jenis Masalah = Jenis Masalah

Penama Kedua = Penama Kedua (Untuk Dihubungi)
Tambah Penama = Tambah Penama

Simpan = Simpan
Batal = Batal
Kemaskini = Kemaskini
Padam = Padam
```

**Dashboard:**
```
Jumlah Isi Rumah = Jumlah Isi Rumah
Purata Ahli Keluarga = Purata Ahli Keluarga
Keluarga Rumah Sendiri = Keluarga Rumah Sendiri
Keluarga Rumah Sewa = Keluarga Rumah Sewa
Penerima Bantuan = Penerima Bantuan
Keluarga dengan OKU = Keluarga dengan OKU
Taburan Pendapatan = Taburan Pendapatan
Pendaftaran Terkini = Pendaftaran Terkini
```

**Messages:**
```
Berjaya disimpan = Berjaya disimpan
Ralat berlaku = Ralat berlaku
No. K/P sudah wujud dalam sistem = No. K/P sudah wujud dalam sistem
Sila isi maklumat yang diperlukan = Sila isi maklumat yang diperlukan
Tiada rekod dijumpai = Tiada rekod dijumpai
```

### 7.3 Component Specifications

#### StatCard Component
```tsx
// Props
interface StatCardProps {
  title: string;      // e.g., "Jumlah Isi Rumah"
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red';
}
```

#### HouseholdForm Component
```tsx
// Form sections:
// 1. Maklumat Pemohon (applicant info)
// 2. Senarai Tanggungan (dependents - dynamic array)
// 3. Bantuan Bulanan (assistance)
// 4. OKU / Penyakit Kekal (disability)
// 5. Penama Kedua (emergency contacts - dynamic array)

// Features:
// - Dynamic add/remove for dependents
// - Dynamic add/remove for emergency contacts
// - IC duplicate check on blur
// - Mobile responsive layout
```

#### HouseholdTable Component
```tsx
// Columns:
// - Nama
// - No. K/P
// - Alamat
// - Pendapatan
// - Status
// - Tanggungan
// - Tindakan (View/Edit)

// Features:
// - Search input
// - Filters (housing status, income range)
// - Pagination
// - Sort by columns
```

---

## 8. Development Phases

### PHASE 1: Project Setup (Priority: HIGH)

#### Task 1.1: Initialize Monorepo
```bash
# Create project folder
mkdir mkcs
cd mkcs

# Initialize root package.json (optional for scripts)
npm init -y
```

#### Task 1.2: Setup Frontend (Next.js)
```bash
cd mkcs
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir

# Install dependencies
cd frontend
npm install axios react-hook-form @hookform/resolvers zod
npm install lucide-react recharts
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge

# Setup shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label table dialog alert dropdown-menu select checkbox textarea tabs badge separator sheet avatar
```

#### Task 1.3: Setup Backend (NestJS)
```bash
cd mkcs
npx @nestjs/cli new backend --package-manager npm

# Install dependencies
cd backend
npm install @prisma/client
npm install prisma --save-dev
npm install @nestjs/passport passport passport-jwt @nestjs/jwt
npm install bcrypt class-validator class-transformer
npm install --save-dev @types/passport-jwt @types/bcrypt

# Initialize Prisma
npx prisma init
```

#### Task 1.4: Setup Database
```bash
# In backend folder, create prisma/schema.prisma with schema from Section 5
# Then run:
npx prisma migrate dev --name init
npx prisma generate
```

#### Task 1.5: Create Docker Compose
```yaml
# docker-compose.yml at root
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: mkcs
      POSTGRES_PASSWORD: mkcs_password
      POSTGRES_DB: mkcs_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://mkcs:mkcs_password@postgres:5432/mkcs_db
      JWT_SECRET: your-super-secret-key-change-in-production
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Task 1.6: Create Seed Script
- Implement `prisma/seed.ts` as specified in Section 5.2
- Add seed command to `package.json`
- Run `npx prisma db seed`

---

### PHASE 2: Authentication (Priority: HIGH)

#### Task 2.1: Backend Auth Module
Create files:
- `src/auth/auth.module.ts`
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/jwt.strategy.ts`
- `src/auth/dto/login.dto.ts`

Implementation:
1. Login endpoint that validates email/password
2. Returns JWT access token (15min expiry) and refresh token (7d expiry)
3. JWT strategy for protected routes
4. Password hashing with bcrypt

#### Task 2.2: Backend Guards
Create files:
- `src/common/guards/jwt-auth.guard.ts`
- `src/common/guards/roles.guard.ts`
- `src/common/decorators/roles.decorator.ts`

#### Task 2.3: Frontend Auth Context
Create files:
- `src/context/AuthContext.tsx`
- `src/hooks/useAuth.ts`
- `src/lib/api.ts` (axios instance with interceptors)

#### Task 2.4: Login Page
Create `src/app/login/page.tsx`:
- Email input
- Password input
- Login button
- Error message display
- Redirect to dashboard on success

#### Task 2.5: Protected Routes
Create middleware or layout guard:
- Check for valid token
- Redirect to login if not authenticated
- Store user info in context

---

### PHASE 3: Form Submission (Priority: HIGH)

#### Task 3.1: Backend Household Module
Create files:
- `src/household/household.module.ts`
- `src/household/household.controller.ts`
- `src/household/household.service.ts`
- `src/household/dto/create-household.dto.ts`
- `src/household/dto/update-household.dto.ts`

Implementation:
1. Create household with version 1
2. Validate IC not duplicate (within same masjid)
3. Create/link Person records for dependents
4. Create emergency contacts
5. Update creates new version (increment versionNo)

#### Task 3.2: Frontend Form Components
Create files:
- `src/components/forms/HouseholdForm.tsx`
- `src/components/forms/DependentFields.tsx`
- `src/components/forms/DisabilityFields.tsx`
- `src/components/forms/EmergencyContactFields.tsx`

#### Task 3.3: New Form Page
Create `src/app/(dashboard)/borang/baru/page.tsx`:
- Full form matching paper borang layout
- Section A: Maklumat Pemohon
- Section B: Senarai Tanggungan (dynamic)
- Section C: Bantuan Bulanan
- Section D: OKU / Penyakit Kekal
- Section E: Penama Kedua (dynamic)
- Submit button
- Success/error toast messages

#### Task 3.4: IC Duplicate Check
- Add API endpoint `GET /api/household/check-ic/:icNo`
- Frontend: Check IC on blur, show warning if exists

---

### PHASE 4: Dashboard (Priority: HIGH)

#### Task 4.1: Backend Analytics Module
Create files:
- `src/analytics/analytics.module.ts`
- `src/analytics/analytics.controller.ts`
- `src/analytics/analytics.service.ts`

Implement endpoints:
- `/api/analytics/summary` - All KPIs
- `/api/analytics/income-distribution` - For charts
- `/api/analytics/housing-status` - For charts

#### Task 4.2: Dashboard Layout
Create `src/app/(dashboard)/layout.tsx`:
- Sidebar navigation
- Header with user info
- Mobile responsive (hamburger menu)

#### Task 4.3: Sidebar Component
Create `src/components/layout/Sidebar.tsx`:
- Logo
- Navigation links (Papan Pemuka, Borang Baru, Senarai Isi Rumah, Laporan)
- User info at bottom
- Logout button

#### Task 4.4: Dashboard Page
Create `src/app/(dashboard)/dashboard/page.tsx`:
- 6 KPI StatCards (2x3 grid)
- Income distribution chart (bar chart)
- Housing status chart (pie chart)
- Recent submissions list

#### Task 4.5: Chart Components
Create files:
- `src/components/dashboard/StatCard.tsx`
- `src/components/dashboard/IncomeChart.tsx`
- `src/components/dashboard/HousingChart.tsx`
- `src/components/dashboard/RecentSubmissions.tsx`

---

### PHASE 5: Search & Household Management (Priority: HIGH)

#### Task 5.1: Household List API
Implement `GET /api/household` with:
- Search by name, IC, address
- Filter by housing status
- Filter by income range
- Pagination (page, limit)
- Sort (column, direction)

#### Task 5.2: Household List Page
Create `src/app/(dashboard)/isi-rumah/page.tsx`:
- Search input
- Filter dropdowns
- Results table
- Pagination controls
- Click row to view detail

#### Task 5.3: HouseholdTable Component
Create `src/components/household/HouseholdTable.tsx`:
- Columns: Nama, No. K/P, Alamat, Pendapatan, Status, Tanggungan, Tindakan
- Responsive table (horizontal scroll on mobile)

#### Task 5.4: Household Detail Page
Create `src/app/(dashboard)/isi-rumah/[id]/page.tsx`:
- Display all household info
- Dependents list
- Disability info
- Emergency contacts
- Edit button
- Version history accordion

#### Task 5.5: Edit Household
- Reuse HouseholdForm component
- Pre-populate with current data
- Submit creates new version
- Show success message with new version number

---

### PHASE 6: Export (Priority: HIGH)

#### Task 6.1: Backend Export Module
Create files:
- `src/export/export.module.ts`
- `src/export/export.controller.ts`
- `src/export/export.service.ts`

Install dependencies:
```bash
npm install exceljs pdfkit
```

#### Task 6.2: Excel Export
Implement `GET /api/export/excel`:
- Generate Excel file with all households
- Columns: All fields
- Return as downloadable file

#### Task 6.3: CSV Export
Implement `GET /api/export/csv`:
- Same data as Excel
- Return as CSV file

#### Task 6.4: PDF Export (Single Household)
Implement `GET /api/export/pdf/:householdId`:
- Generate PDF matching paper form layout
- Include masjid header with logo
- All sections from paper form

#### Task 6.5: Reports Page
Create `src/app/(dashboard)/laporan/page.tsx`:
- Export Excel button (all data)
- Export CSV button (all data)
- Date range filter (optional)
- Summary report PDF button

---

### PHASE 7: User Management (Priority: MEDIUM)

#### Task 7.1: Backend User Module
Create files:
- `src/user/user.module.ts`
- `src/user/user.controller.ts`
- `src/user/user.service.ts`
- `src/user/dto/create-user.dto.ts`
- `src/user/dto/update-user.dto.ts`

Endpoints (ADMIN only):
- `GET /api/user` - List users
- `POST /api/user` - Create user
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Deactivate user

#### Task 7.2: User Management Page
Create `src/app/(dashboard)/pengguna/page.tsx`:
- User list table
- Add user button (opens modal)
- Edit user button
- Deactivate user button
- Only visible to ADMIN role

---

### PHASE 8: Deployment (Priority: HIGH)

#### Task 8.1: Production Docker Files
Create:
- `frontend/Dockerfile`
- `backend/Dockerfile`
- `docker-compose.prod.yml`
- `nginx/nginx.conf`
- `nginx/Dockerfile`

#### Task 8.2: Environment Configuration
Create `.env` files:
- `frontend/.env.production`
- `backend/.env.production`

#### Task 8.3: VPS Setup
1. Install Docker and Docker Compose
2. Clone repository
3. Configure environment variables
4. Run `docker-compose -f docker-compose.prod.yml up -d`

#### Task 8.4: SSL Setup
1. Install Certbot
2. Obtain SSL certificate
3. Configure Nginx for HTTPS

#### Task 8.5: Initial Data
1. Run database migrations
2. Run seed script
3. Create initial admin user
4. Test all functionality

---

## 9. Deployment Guide

### 9.1 VPS Requirements
- Ubuntu 22.04 LTS (recommended)
- 2GB RAM minimum
- 20GB SSD
- Docker & Docker Compose installed

### 9.2 Deployment Commands
```bash
# On VPS
git clone <repository-url> mkcs
cd mkcs

# Create .env files
cp frontend/.env.example frontend/.env.production
cp backend/.env.example backend/.env.production
# Edit .env files with production values

# Build and run
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

# Check logs
docker-compose logs -f
```

### 9.3 Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 10. Testing Checklist

### 10.1 Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Token refresh works
- [ ] Logout clears session
- [ ] Protected routes redirect to login

### 10.2 Form Submission
- [ ] Create household with all fields
- [ ] Create household with minimal fields
- [ ] Add multiple dependents
- [ ] Remove dependent
- [ ] Add emergency contact
- [ ] IC duplicate check works
- [ ] Form validation messages display

### 10.3 Dashboard
- [ ] All KPI cards show correct values
- [ ] Income chart displays correctly
- [ ] Housing chart displays correctly
- [ ] Recent submissions list updates

### 10.4 Search & Management
- [ ] Search by name works
- [ ] Search by IC works
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] View household detail
- [ ] Edit household creates new version
- [ ] Version history displays

### 10.5 Export
- [ ] Excel export downloads correctly
- [ ] CSV export downloads correctly
- [ ] PDF export generates correct layout
- [ ] PDF includes all data

### 10.6 User Management
- [ ] List users (ADMIN)
- [ ] Create user (ADMIN)
- [ ] Edit user (ADMIN)
- [ ] Deactivate user (ADMIN)
- [ ] Non-admin cannot access

### 10.7 Mobile Responsiveness
- [ ] Login page responsive
- [ ] Dashboard responsive
- [ ] Form responsive
- [ ] Table scrolls horizontally
- [ ] Sidebar collapses to hamburger

---

## Appendix A: Common Relationship Values (Hubungan)

```
Isteri / Suami
Anak
Ibu
Bapa
Adik-beradik
Datuk / Nenek
Cucu
Ipar
Mertua
Anak Angkat
Lain-lain
```

## Appendix B: Common Occupation Values (Pekerjaan)

```
Bekerja Sendiri
Kakitangan Kerajaan
Kakitangan Swasta
Pesara
Suri Rumah
Pelajar
Tidak Bekerja
Petani / Nelayan
Peniaga
Lain-lain
```

## Appendix C: Disability Types (Jenis OKU)

```
Lumpuh
Kanak-kanak Istimewa (OKU Pembelajaran)
Hilang Upaya Kekal
Masalah Penglihatan
Masalah Pendengaran
Masalah Pertuturan
Penyakit Kronik
Lain-lain
```

---

## End of Document

**Version**: 1.0
**Last Updated**: January 2026
**Author**: AI Development Assistant

This document provides complete specifications for developing the Masjid Kariah Census System. Follow each phase sequentially, completing all tasks before moving to the next phase.
