// Prisma 7 Seed Script - Workaround for DATABASE_URL issue
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load .env file
const envPath = resolve(__dirname, '../.env');
config({ path: envPath });

// Get DATABASE_URL from environment
let databaseUrl = process.env.DATABASE_URL;

// If not in env, try reading from prisma.config.ts
if (!databaseUrl) {
  try {
    const configPath = resolve(__dirname, '../prisma.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');
    const match = configContent.match(/url:\s*process\.env\["DATABASE_URL"\]/);
    // Fallback: read directly from .env file
    const envContent = readFileSync(envPath, 'utf-8');
    const envMatch = envContent.match(/DATABASE_URL=(.+)/);
    if (envMatch) {
      databaseUrl = envMatch[1].trim();
    }
  } catch (e) {
    // Ignore
  }
}

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

// CRITICAL: Set DATABASE_URL in process.env BEFORE importing PrismaClient
// Prisma 7 reads it at module load time
process.env.DATABASE_URL = databaseUrl;

// Also set it globally to ensure it's available
(global as any).DATABASE_URL = databaseUrl;

console.log('✅ DATABASE_URL:', databaseUrl.replace(/:[^:@]+@/, ':****@'));

// Now import PrismaClient - it should read DATABASE_URL from process.env
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Create PrismaClient
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Test connection
  await prisma.$connect();
  console.log('✅ Connected to database');

  // Create Masjid Al-Huda Padang Matsirat
  const masjid = await prisma.masjid.upsert({
    where: { id: 'masjid-alhuda' },
    update: {},
    create: {
      id: 'masjid-alhuda',
      name: 'Masjid Al-Huda Padang Matsirat',
      address: '07100 Langkawi, Kedah Darul Aman',
      phone: '',
    },
  });
  console.log('✅ Masjid created:', masjid.name);

  // Create Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@masjidalhuda.my' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@masjidalhuda.my',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      masjidId: masjid.id,
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // Create Imam User
  const imamPasswordHash = await bcrypt.hash('imam123', 10);
  const imamUser = await prisma.user.upsert({
    where: { email: 'imam@masjidalhuda.my' },
    update: {},
    create: {
      name: 'Imam Masjid',
      email: 'imam@masjidalhuda.my',
      passwordHash: imamPasswordHash,
      role: 'IMAM',
      masjidId: masjid.id,
    },
  });
  console.log('✅ Imam user created:', imamUser.email);

  // Create Staff User
  const staffPasswordHash = await bcrypt.hash('staff123', 10);
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@masjidalhuda.my' },
    update: {},
    create: {
      name: 'Staf Pengurusan',
      email: 'staff@masjidalhuda.my',
      passwordHash: staffPasswordHash,
      role: 'PENGURUSAN',
      masjidId: masjid.id,
    },
  });
  console.log('✅ Staff user created:', staffUser.email);

  // Create Disability Types
  const disabilityTypes = [
    'Lumpuh',
    'Kanak-kanak Istimewa (OKU Pembelajaran)',
    'Hilang Upaya Kekal',
    'Masalah Penglihatan',
    'Masalah Pendengaran',
    'Masalah Pertuturan',
    'Penyakit Kronik',
    'Masalah Mental',
    'Lain-lain',
  ];

  for (const typeName of disabilityTypes) {
    await prisma.disabilityType.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });
  }
  console.log('✅ Disability types created:', disabilityTypes.length);

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Login credentials:');
  console.log('   Admin:  admin@masjidalhuda.my / admin123');
  console.log('   Imam:   imam@masjidalhuda.my / imam123');
  console.log('   Staff:  staff@masjidalhuda.my / staff123');
  console.log('');
  console.log('⚠️  Change passwords in production!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
