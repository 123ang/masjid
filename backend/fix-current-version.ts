// Script to fix households without currentVersionId
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env
const envPath = resolve(__dirname, '.env');
config({ path: envPath });

const prisma = new PrismaClient();

async function fixCurrentVersions() {
  console.log('🔍 Checking households without currentVersionId...');

  // Find all households without currentVersionId
  const householdsWithoutVersion = await prisma.household.findMany({
    where: {
      currentVersionId: null,
    },
    include: {
      versions: {
        orderBy: {
          versionNo: 'desc',
        },
        take: 1,
      },
    },
  });

  console.log(`📊 Found ${householdsWithoutVersion.length} households without currentVersionId`);

  if (householdsWithoutVersion.length === 0) {
    console.log('✅ All households have currentVersionId set!');
    await prisma.$disconnect();
    return;
  }

  // Fix each household
  for (const household of householdsWithoutVersion) {
    if (household.versions.length > 0) {
      const latestVersion = household.versions[0];
      await prisma.household.update({
        where: { id: household.id },
        data: { currentVersionId: latestVersion.id },
      });
      console.log(`✅ Fixed household ${household.id} - set currentVersionId to version ${latestVersion.versionNo}`);
    } else {
      console.log(`⚠️  Household ${household.id} has no versions - cannot set currentVersionId`);
    }
  }

  console.log('✅ Done! All households have been fixed.');
  await prisma.$disconnect();
}

fixCurrentVersions().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
