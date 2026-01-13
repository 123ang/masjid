# Masjid Kariah Census System (MKCS)

## 1. Overview
The Masjid Kariah Census System (MKCS) is a **web-based internal system** used by masjid management (Imam / Pengurusan) to digitize paper-based *Borang Bancian Anak Kariah*, manage household data, track historical changes, and generate analytics and reports.

This system is **not public-facing**. All data entry is performed by authorized masjid staff based on paper forms submitted by kariah members.

The system is designed to:
- Replace paper forms completely
- Preserve historical records (versioning)
- Support analytics and reporting
- Be reusable by other masjids in the future (multi-masjid ready)

---

## 2. Technology Stack (Option A)

### Frontend
- **React** (recommended: Next.js for routing and layout)
- UI Library: Ant Design / MUI (admin-friendly)
- Form handling: React Hook Form

### Backend
- **Node.js**
- **NestJS** (preferred for structure) or Express.js
- RESTful API

### Database
- **PostgreSQL**
- ORM: Prisma or TypeORM

### Authentication
- Email + Password
- JWT (access + refresh token)
- Role-based access control (RBAC)

### Hosting
- Single VPS (DigitalOcean / Hetzner / AWS Lightsail)
- Dockerized services

---

## 3. User Roles & Access Control

| Role | Description | Permissions |
|---|---|---|
| ADMIN | System administrator | Full access, manage users & masjid |
| IMAM | Masjid authority | View, edit, approve, reports |
| PENGURUSAN | Masjid staff | Data entry, edit, reports |

> Future roles (OFFICER, VIEWER) are supported by RBAC but not implemented in MVP.

---

## 4. System Architecture

Frontend (React)
→ REST API (NestJS)
→ PostgreSQL Database

All requests must include authenticated JWT token.

---

## 5. Core Data Model (Database Schema)

### 5.1 Masjid (Tenant)
```
masjid
- id (PK)
- name
- address
- phone
- created_at
```

---

### 5.2 User
```
user
- id (PK)
- masjid_id (FK)
- name
- email
- password_hash
- role (ADMIN | IMAM | PENGURUSAN)
- is_active
- created_at
```

---

### 5.3 Household (Stable Identity)
```
household
- id (PK, auto-generated)
- masjid_id (FK)
- created_at
- current_version_id (FK -> household_version.id)
```

---

### 5.4 Household Version (Snapshot History)
Each edit creates a new version.
```
household_version
- id (PK)
- household_id (FK)
- version_no
- created_by_user_id (FK)
- created_at

- applicant_name
- ic_no
- phone
- address
- net_income
- housing_status (OWN | RENT)

- assistance_monthly_received (BOOLEAN)
- assistance_provider_text

- disability_in_family (BOOLEAN)
- disability_notes_text
```

---

### 5.5 Person (Reusable Dependents)
```
person
- id (PK)
- full_name
- ic_no
- phone
- created_at
```

---

### 5.6 Household Version Dependents
```
household_version_dependent
- id (PK)
- household_version_id (FK)
- person_id (FK)
- relationship
- status
- occupation
```

---

### 5.7 Disability Types (Predefined)
```
disability_type
- id (PK)
- name
```

---

### 5.8 Disability Mapping
```
household_version_disability_member
- id (PK)
- household_version_id (FK)
- person_id (FK)
- disability_type_id (FK, nullable)
- notes_text
```

---

### 5.9 Emergency Contact
```
household_version_emergency_contact
- id (PK)
- household_version_id (FK)
- name
- phone
- relationship
```

---

### 5.10 Submission Tracking
```
submission
- id (PK)
- household_id (FK)
- received_date
- received_by_user_id (FK)
- notes
```

---

## 6. Versioning Logic (Critical)

### Rules
- Household identity never changes
- Editing household data creates a **new household_version**
- `current_version_id` always points to latest version
- Old versions are read-only

### Example
- Version 1: Income RM1200
- Version 2: Income RM1000 (new year)

Analytics can compare versions over time.

---

## 7. Key API Endpoints (Example)

### Authentication
- POST /auth/login
- POST /auth/refresh

### Household
- POST /household (create new)
- GET /household?search=
- GET /household/:id
- PUT /household/:id (creates new version)

### Dependents
- POST /person
- LINK person to household_version

### Reports
- GET /reports/summary
- GET /reports/income-distribution
- GET /reports/oku

### Export
- GET /export/csv
- GET /export/excel
- GET /export/pdf

---

## 8. UI Pages (Staff-Facing)

1. Login
2. Dashboard (KPIs)
3. Household List (search & filters)
4. Create Household (form mirrors paper borang)
5. Household Profile
   - Latest info
   - Dependents
   - Disability info
   - Emergency contact
   - Version history
6. Reports & Export
7. User Management (ADMIN only)

---

## 9. Analytics (MVP)

### Population
- Total households
- Average household size
- Dependents count distribution

### Income
- Income range distribution
- Low-income households with many dependents

### Health / Vulnerability
- Households with OKU / chronic illness

### Operational
- Records not updated > 12 months
- Duplicate IC detection

---

## 10. Export Formats

- CSV: raw data
- Excel: summary + detail sheets
- PDF: printable digital borang (layout similar to paper form)

---

## 11. Security Considerations

- JWT authentication
- Role-based authorization
- Audit logging (who edited what)
- IC number visible but protected by login
- Daily database backups

---

## 12. Deployment Notes

- Docker Compose (frontend + backend + postgres)
- Nginx reverse proxy
- HTTPS via Let’s Encrypt

---

## 13. MVP Scope (Strict)

Included:
- Digital data entry
- Versioning
- Search
- Analytics
- Export

Excluded:
- Public access
- File upload
- Aid eligibility automation
- SMS / WhatsApp integration

---

## 14. Future Enhancements (Out of Scope)

- Zakat / aid workflow
- Document upload
- Mobile app
- Government integration

---

## 15. Conclusion

This architecture prioritizes **simplicity, data integrity, and long-term usefulness** while keeping infrastructure cost low. It fully replaces paper forms and creates a reliable foundation for future aid decision-making without locking the masjid into complex systems early.

