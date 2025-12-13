// Test script to verify database connection with production URLs
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

async function testConnection() {
  console.log('🔍 Testing Database Connection...\n');

  // Test with Accelerate URL
  const accelerateUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  console.log('Environment Variables:');
  console.log(`- DATABASE_URL: ${accelerateUrl ? 'SET' : 'NOT SET'}`);
  console.log(`- DIRECT_URL: ${directUrl ? 'SET' : 'NOT SET'}\n`);

  if (!accelerateUrl && !directUrl) {
    console.error('❌ No database URL found in environment');
    return;
  }

  // Test 1: With Accelerate URL
  if (accelerateUrl) {
    console.log('📡 Testing with Accelerate URL...');
    try {
      const adapter = new PrismaPg({
        url: accelerateUrl
      });

      const prisma = new PrismaClient({ adapter });

      const result = await prisma.$queryRaw`SELECT version() as version`;
      console.log('✅ Accelerate connection successful');
      console.log('   PostgreSQL:', result[0]?.version?.substring(0, 50) + '...\n');

      await prisma.$disconnect();
    } catch (error) {
      console.error('❌ Accelerate connection failed:', error.message);
      console.log('   Code:', error.code);
    }
  }

  // Test 2: With Direct URL
  if (directUrl) {
    console.log('📡 Testing with Direct URL...');
    try {
      const adapter = new PrismaPg({
        url: directUrl
      });

      const prisma = new PrismaClient({ adapter });

      const result = await prisma.$queryRaw`SELECT version() as version`;
      console.log('✅ Direct connection successful');
      console.log('   PostgreSQL:', result[0]?.version?.substring(0, 50) + '...\n');

      await prisma.$disconnect();
    } catch (error) {
      console.error('❌ Direct connection failed:', error.message);
      console.log('   Code:', error.code);
    }
  }

  // Test 3: Check if we can query the user table
  if (accelerateUrl) {
    console.log('🔍 Testing user table access...');
    try {
      const adapter = new PrismaPg({
        url: accelerateUrl
      });

      const prisma = new PrismaClient({ adapter });

      const userCount = await prisma.user.count();
      console.log(`✅ User table accessible - Found ${userCount} users\n`);

      await prisma.$disconnect();
    } catch (error) {
      console.error('❌ User table access failed:', error.message);
    }
  }
}

testConnection().catch(console.error);