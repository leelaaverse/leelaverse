import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Extend global type for test prisma instance
declare global {
  var prisma: PrismaClient;
}

// Global test database setup
let prisma: PrismaClient;

beforeAll(async () => {
  // Set test database URL
  process.env.DATABASE_URL = 'file:./test.db';

  // Generate Prisma client for test database
  execSync('npx prisma generate --schema=./prisma/schema.prisma', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' }
  });

  // Push schema to test database
  execSync('npx prisma db push --schema=./prisma/schema.prisma --force-reset', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' }
  });

  // Create Prisma client instance
  prisma = new PrismaClient({
    datasourceUrl: 'file:./test.db',
  });

  // Make prisma available globally for tests
  global.prisma = prisma;

  // Clean up any existing data
  await prisma.$transaction([
    prisma.like.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  // Clean up test database
  if (prisma) {
    await prisma.$disconnect();
  }

  // Remove test database file
  try {
    execSync('rm -f test.db');
  } catch (error) {
    // Ignore cleanup errors
  }
});
