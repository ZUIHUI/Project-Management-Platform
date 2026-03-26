import 'dotenv/config';
import { seedData } from './src/data/prismaDB.ts';

async function main() {
  console.log('Starting seed...');
  try {
    await seedData();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seed failed:', error);
  }
}

main();