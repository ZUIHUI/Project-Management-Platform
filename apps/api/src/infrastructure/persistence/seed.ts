import { prisma } from './prisma.js';

const DEMO_PASSWORD_HASH = '$2b$10$TToBgUlW0lz70sAAZBxyF.cnDQZLSwITS0nkMihoHF3z8s4GbH2dq';

export const seedDatabase = async () => {
  await prisma.user.upsert({
    where: { id: 'user-owner' },
    update: {},
    create: { id: 'user-owner', name: 'Owner', email: 'owner@example.com', password: DEMO_PASSWORD_HASH, role: 'owner' },
  });
  await prisma.user.upsert({
    where: { id: 'user-pm' },
    update: {},
    create: { id: 'user-pm', name: 'PM', email: 'pm@example.com', password: DEMO_PASSWORD_HASH, role: 'project_admin' },
  });
  await prisma.user.upsert({
    where: { id: 'user-dev' },
    update: {},
    create: { id: 'user-dev', name: 'Developer', email: 'dev@example.com', password: DEMO_PASSWORD_HASH, role: 'member' },
  });

  await prisma.project.upsert({
    where: { id: 'proj-1' },
    update: {},
    create: {
      id: 'proj-1',
      key: 'CORE',
      name: 'Core Refactor',
      description: 'Strict rewrite based on spec.',
      ownerId: 'user-pm',
      status: 'active',
    },
  });

  await Promise.all([
    prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: 'proj-1', userId: 'user-pm' } },
      update: { role: 'project_admin' },
      create: { projectId: 'proj-1', userId: 'user-pm', role: 'project_admin' },
    }),
    prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: 'proj-1', userId: 'user-dev' } },
      update: { role: 'member' },
      create: { projectId: 'proj-1', userId: 'user-dev', role: 'member' },
    }),
  ]);

  await Promise.all([
    prisma.status.upsert({ where: { id: 'todo' }, update: { name: 'Todo', order: 1 }, create: { id: 'todo', name: 'Todo', order: 1 } }),
    prisma.status.upsert({ where: { id: 'doing' }, update: { name: 'Doing', order: 2 }, create: { id: 'doing', name: 'Doing', order: 2 } }),
    prisma.status.upsert({ where: { id: 'done' }, update: { name: 'Done', order: 3 }, create: { id: 'done', name: 'Done', order: 3 } }),
  ]);

  await Promise.all([
    prisma.transition.upsert({
      where: { fromStatusId_toStatusId: { fromStatusId: 'todo', toStatusId: 'doing' } },
      update: {},
      create: { fromStatusId: 'todo', toStatusId: 'doing' },
    }),
    prisma.transition.upsert({
      where: { fromStatusId_toStatusId: { fromStatusId: 'doing', toStatusId: 'todo' } },
      update: {},
      create: { fromStatusId: 'doing', toStatusId: 'todo' },
    }),
    prisma.transition.upsert({
      where: { fromStatusId_toStatusId: { fromStatusId: 'doing', toStatusId: 'done' } },
      update: {},
      create: { fromStatusId: 'doing', toStatusId: 'done' },
    }),
    prisma.transition.upsert({
      where: { fromStatusId_toStatusId: { fromStatusId: 'done', toStatusId: 'doing' } },
      update: {},
      create: { fromStatusId: 'done', toStatusId: 'doing' },
    }),
  ]);

  await prisma.milestone.upsert({
    where: { id: 'ms-1' },
    update: {},
    create: { id: 'ms-1', projectId: 'proj-1', name: 'MVP API ready', status: 'open' },
  });
  await prisma.sprint.upsert({
    where: { id: 'sp-1' },
    update: {},
    create: {
      id: 'sp-1',
      projectId: 'proj-1',
      name: 'Sprint 1',
      goal: 'Issue flow baseline',
      startAt: new Date(),
      status: 'active',
    },
  });
};
