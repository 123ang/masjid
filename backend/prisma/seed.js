// Prisma 7 Seed Script (JavaScript version)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { config } = require('dotenv');
const { resolve } = require('path');

// Load .env file
const envPath = resolve(__dirname, '../.env');
config({ path: envPath });

// Verify DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env file');
  process.exit(1);
}

console.log('✅ DATABASE_URL loaded:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

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
