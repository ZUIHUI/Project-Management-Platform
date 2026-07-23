import 'dotenv/config';
import { prisma } from './src/infrastructure/persistence/prisma.js';
import { seedDatabase } from './src/infrastructure/persistence/seed.js';

async function main() {
  console.log('Starting seed...');
  try {
    await seedDatabase();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
