import { prisma } from './prismaDB.ts';
import { randomUUID } from 'crypto';

export const db = prisma;
export const idFactory = (prefix) => `${prefix}-${randomUUID()}`;
