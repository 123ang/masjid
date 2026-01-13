// Prisma 7 Seed Script with Sample Data
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load .env file
const envPath = resolve(__dirname, '../.env');
config({ path: envPath });

// Get DATABASE_URL from environment
let databaseUrl = process.env.DATABASE_URL;

// If not in env, try reading from .env file directly
if (!databaseUrl) {
  try {
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

// Set DATABASE_URL in process.env BEFORE importing PrismaClient
process.env.DATABASE_URL = databaseUrl;

console.log('✅ DATABASE_URL:', databaseUrl.replace(/:[^:@]+@/, ':****@'));

// Now import PrismaClient
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to generate random Malaysian IC
function generateIC() {
  const year = Math.floor(Math.random() * 50) + 60; // 1960-2010
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const state = '02'; // Kedah
  const random = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `${year}${month}${day}${state}${random}`;
}

// Helper to generate phone numbers
function generatePhone() {
  const prefixes = ['011', '012', '013', '014', '015', '016', '017', '018', '019'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
  return `${prefix}-${number}`;
}

// Sample Malaysian names
const maleNames = [
  'Ahmad bin Abdullah', 'Muhammad bin Hassan', 'Ali bin Ibrahim', 'Ismail bin Yusof',
  'Hassan bin Ahmad', 'Ibrahim bin Ismail', 'Yusof bin Ali', 'Abdullah bin Rahman',
  'Rahman bin Hassan', 'Razak bin Ibrahim', 'Aziz bin Ahmad', 'Karim bin Yusof',
  'Hafiz bin Abdullah', 'Farid bin Rahman', 'Hakim bin Razak'
];

const femaleNames = [
  'Siti binti Abdullah', 'Noraini binti Hassan', 'Fatimah binti Ibrahim', 'Aminah binti Yusof',
  'Khadijah binti Ahmad', 'Aishah binti Ismail', 'Zainab binti Ali', 'Maryam binti Rahman',
  'Halimah binti Hassan', 'Ruqayyah binti Ibrahim', 'Safiyyah binti Razak', 'Hafsah binti Aziz',
  'Asma binti Karim', 'Ummu binti Hafiz', 'Zulaikha binti Farid'
];

const childNames = [
  'Nur Aisyah', 'Muhammad Haziq', 'Nur Amira', 'Ahmad Hafiz', 'Siti Nurhaliza',
  'Muhammad Amir', 'Nur Insyirah', 'Ahmad Danial', 'Siti Aisyah', 'Muhammad Iqbal',
  'Nur Hana', 'Ahmad Zikri', 'Siti Maisarah', 'Muhammad Faiz', 'Nur Sofea'
];

const streets = [
  'Jalan Padang Matsirat', 'Jalan Kuala Teriang', 'Jalan Ayer Hangat', 'Jalan Pantai Chenang',
  'Jalan Pantai Tengah', 'Jalan Teluk Baru', 'Jalan Padang Lalang', 'Jalan Kuah',
  'Jalan Kelibang', 'Jalan Kampung Kok', 'Jalan Datai', 'Jalan Pantai Kok',
  'Jalan Telaga Harbour', 'Jalan Bohor', 'Jalan Padang Gaong'
];

async function main() {
  console.log('🌱 Starting seed with sample data...');

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

  // Create Users
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

  const createdDisabilityTypes = [];
  for (const typeName of disabilityTypes) {
    const dt = await prisma.disabilityType.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });
    createdDisabilityTypes.push(dt);
  }
  console.log('✅ Disability types created:', disabilityTypes.length);

  // Create Sample Households
  console.log('🏠 Creating sample households...');

  const incomeRanges = [
    'KURANG_RM2000',
    'RM2000_RM3999',
    'RM4000_RM5999',
    'RM6000_RM9999',
    'RM10000_LEBIH',
  ];

  const housingStatuses = [
    'RUMAH_SENDIRI',
    'SEWA',
    'RUMAH_KERAJAAN',
    'RUMAH_IBUBAPASUAMI',
    'RUMAH_IBUBAPAISTERI',
    'LAINLAIN',
  ];

  const employmentStatuses = [
    'BEKERJA_SEPENUH_MASA',
    'BEKERJA_SEPARUH_MASA',
    'BEKERJA_SENDIRI',
    'PENGANGGUR',
    'PESARA',
    'PELAJAR',
    'SURI_RUMAH',
  ];

  // Create 50 sample households with variety
  for (let i = 0; i < 50; i++) {
    const isHeadMale = Math.random() > 0.5;
    const headName = isHeadMale
      ? maleNames[Math.floor(Math.random() * maleNames.length)]
      : femaleNames[Math.floor(Math.random() * femaleNames.length)];

    const headIC = generateIC();
    const street = streets[Math.floor(Math.random() * streets.length)];
    const houseNumber = Math.floor(Math.random() * 500) + 1;

    // Create household
    const household = await prisma.household.create({
      data: {
        masjidId: masjid.id,
        headOfHouseholdName: headName,
        headOfHouseholdIC: headIC,
      },
    });

    // Create household version (initial)
    const numDependents = Math.floor(Math.random() * 5); // 0-4 dependents
    const hasOKU = Math.random() > 0.85; // 15% chance of having OKU member
    const incomeRange = incomeRanges[Math.floor(Math.random() * incomeRanges.length)];
    const housingStatus = housingStatuses[Math.floor(Math.random() * housingStatuses.length)];

    const version = await prisma.householdVersion.create({
      data: {
        householdId: household.id,
        versionNumber: 1,
        headOfHouseholdName: headName,
        headOfHouseholdIC: headIC,
        headOfHouseholdPhone: generatePhone(),
        headOfHouseholdEmail: ``,
        residentialAddress: `${houseNumber}, ${street}`,
        residentialPostcode: '07100',
        residentialState: 'Kedah',
        employmentStatus: employmentStatuses[Math.floor(Math.random() * employmentStatuses.length)],
        employerName: Math.random() > 0.5 ? 'Swasta' : '',
        monthlyIncome: incomeRange,
        housingStatus: housingStatus,
        numberOfDependents: numDependents,
        submittedBy: adminUser.id,
      },
    });

    // Update household current version
    await prisma.household.update({
      where: { id: household.id },
      data: { currentVersionId: version.id },
    });

    // Create dependents
    for (let j = 0; j < numDependents; j++) {
      const depName = childNames[Math.floor(Math.random() * childNames.length)];
      const age = Math.floor(Math.random() * 20) + 1; // 1-20 years old

      await prisma.householdVersionDependent.create({
        data: {
          versionId: version.id,
          name: depName,
          icNumber: age >= 12 ? generateIC() : '',
          relationshipToHead: j === 0 ? 'ANAK' : Math.random() > 0.5 ? 'ANAK' : 'CUCU',
          age: age,
        },
      });
    }

    // Create OKU members if applicable
    if (hasOKU) {
      const disabilityType = createdDisabilityTypes[Math.floor(Math.random() * createdDisabilityTypes.length)];
      
      await prisma.householdVersionDisabilityMember.create({
        data: {
          versionId: version.id,
          name: Math.random() > 0.5 ? headName : childNames[Math.floor(Math.random() * childNames.length)],
          icNumber: generateIC(),
          disabilityTypeId: disabilityType.id,
          requiresAssistance: Math.random() > 0.5,
        },
      });
    }

    // Add emergency contact for some households
    if (Math.random() > 0.3) {
      const contactName = Math.random() > 0.5
        ? maleNames[Math.floor(Math.random() * maleNames.length)]
        : femaleNames[Math.floor(Math.random() * femaleNames.length)];

      await prisma.householdVersionEmergencyContact.create({
        data: {
          versionId: version.id,
          name: contactName,
          relationship: Math.random() > 0.5 ? 'Adik-beradik' : 'Ibu bapa',
          phoneNumber: generatePhone(),
        },
      });
    }

    // Create submission record
    await prisma.submission.create({
      data: {
        householdId: household.id,
        versionId: version.id,
        submittedBy: adminUser.id,
        submittedAt: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000), // Random date within last 6 months
      },
    });

    if ((i + 1) % 10 === 0) {
      console.log(`   Created ${i + 1} households...`);
    }
  }

  console.log('✅ Created 50 sample households with dependents, OKU members, and contacts');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Login credentials:');
  console.log('   Admin:  admin@masjidalhuda.my / admin123');
  console.log('   Imam:   imam@masjidalhuda.my / imam123');
  console.log('   Staff:  staff@masjidalhuda.my / staff123');
  console.log('');
  console.log('📊 Sample data created:');
  console.log('   - 50 households');
  console.log('   - Various income ranges (analytics ready)');
  console.log('   - OKU members (15% of households)');
  console.log('   - Dependents (0-4 per household)');
  console.log('   - Emergency contacts (70% of households)');
  console.log('   - Submission history (last 6 months)');
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
