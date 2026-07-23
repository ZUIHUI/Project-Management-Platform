import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required and must point to PostgreSQL');
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

export const verifyDatabaseConnection = async () => {
  await prisma.$queryRaw`SELECT 1`;
};

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
