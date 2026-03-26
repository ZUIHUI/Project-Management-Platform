// Database service - now uses Prisma with SQLite
import { prisma } from './prismaDB.ts';
import { idFactory } from './inMemoryDB.js'; // Keep idFactory for now

export const db = prisma;
export { idFactory };