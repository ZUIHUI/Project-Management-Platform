import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const statuses = await prisma.status.findMany({ orderBy: { order: 'asc' } });
  assert.deepEqual(
    statuses.map(({ id, name, order }) => ({ id, name, order })),
    [
      { id: 'todo', name: 'Todo', order: 1 },
      { id: 'doing', name: 'Doing', order: 2 },
      { id: 'done', name: 'Done', order: 3 },
    ],
    'migrations must install the canonical workflow without demo seed data',
  );

  const transitions = await prisma.transition.findMany({
    orderBy: [{ fromStatusId: 'asc' }, { toStatusId: 'asc' }],
  });
  assert.deepEqual(
    transitions.map(({ fromStatusId, toStatusId }) => `${fromStatusId}->${toStatusId}`),
    ['doing->done', 'doing->todo', 'done->doing', 'todo->doing'],
    'migrations must install every canonical workflow transition',
  );

  console.log('Core workflow reference data passed');
} finally {
  await prisma.$disconnect();
}
