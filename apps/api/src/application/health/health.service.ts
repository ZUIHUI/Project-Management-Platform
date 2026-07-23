import { verifyDatabaseConnection } from '../../infrastructure/persistence/prisma.js';

export const healthService = {
  async readiness() {
    try {
      await verifyDatabaseConnection();
      return { ready: true as const };
    } catch {
      return { ready: false as const };
    }
  },
};
