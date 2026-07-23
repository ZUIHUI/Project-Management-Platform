import { STATUS } from '../../config/constants.js';
import { db } from '../../infrastructure/persistence/index.js';
import { verifyDatabaseConnection } from '../../infrastructure/persistence/prisma.js';

const requiredStatuses = [
  { id: STATUS.TODO, order: 1 },
  { id: STATUS.DOING, order: 2 },
  { id: STATUS.DONE, order: 3 },
] as const;

const requiredTransitions = new Set([
  `${STATUS.TODO}->${STATUS.DOING}`,
  `${STATUS.DOING}->${STATUS.TODO}`,
  `${STATUS.DOING}->${STATUS.DONE}`,
  `${STATUS.DONE}->${STATUS.DOING}`,
]);

export const healthService = {
  async readiness() {
    try {
      await verifyDatabaseConnection();

      const [statuses, transitions] = await Promise.all([
        db.status.findMany({
          where: { id: { in: requiredStatuses.map((status) => status.id) } },
          select: { id: true, order: true },
        }),
        db.transition.findMany({
          where: {
            fromStatusId: { in: requiredStatuses.map((status) => status.id) },
            toStatusId: { in: requiredStatuses.map((status) => status.id) },
          },
          select: { fromStatusId: true, toStatusId: true },
        }),
      ]);

      const statusOrders = new Map(statuses.map((status) => [status.id, status.order]));
      const transitionKeys = new Set(
        transitions.map((transition) => `${transition.fromStatusId}->${transition.toStatusId}`),
      );
      const workflowReady = requiredStatuses.every(
        (status) => statusOrders.get(status.id) === status.order,
      ) && [...requiredTransitions].every((transition) => transitionKeys.has(transition));

      if (!workflowReady) {
        return { ready: false as const, code: 'CORE_WORKFLOW_UNAVAILABLE' as const };
      }

      return { ready: true as const };
    } catch {
      return { ready: false as const, code: 'DATABASE_UNAVAILABLE' as const };
    }
  },
};
