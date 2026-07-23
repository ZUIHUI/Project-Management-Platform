import { randomUUID } from 'node:crypto';
import { prisma } from './prisma.js';

export const db = prisma;
export const idFactory = (prefix: string) => `${prefix}-${randomUUID()}`;
