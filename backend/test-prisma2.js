// Test PrismaClient with explicit connection string
const databaseUrl = 'postgresql://postgres:920214@localhost:5432/mkcs_db';
process.env.DATABASE_URL = databaseUrl;

// Try importing and creating PrismaClient
const { PrismaClient } = require('@prisma/client');

// Prisma 7 might need the connection string passed differently
// Let's check the PrismaClient constructor
console.log('Testing PrismaClient creation...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

try {
  // Try with explicit connection
  const prisma = new PrismaClient();
  console.log('✅ PrismaClient created');
  prisma.$disconnect();
} catch (error) {
  console.error('❌ Error creating PrismaClient:', error.message);
  console.error('Full error:', error);
}
