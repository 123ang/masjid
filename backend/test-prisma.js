// Test PrismaClient creation
process.env.DATABASE_URL = 'postgresql://postgres:920214@localhost:5432/mkcs_db';

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const { PrismaClient } = require('@prisma/client');

try {
  const prisma = new PrismaClient();
  console.log('✅ PrismaClient created successfully');
  prisma.$disconnect();
} catch (error) {
  console.error('❌ Error:', error.message);
}
