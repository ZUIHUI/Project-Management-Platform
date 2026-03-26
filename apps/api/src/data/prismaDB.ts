import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const prisma = new PrismaClient();

export { prisma };

// Seed data to match inMemoryDB
export const seedData = async () => {
  // Create users with emails and passwords (password: "password" for all)
  const owner = await prisma.user.upsert({
    where: { id: 'user-owner' },
    update: {},
    create: {
      id: 'user-owner',
      name: 'Owner',
      email: 'owner@example.com',
      password: '$2b$10$TToBgUlW0lz70sAAZBxyF.cnDQZLSwITS0nkMihoHF3z8s4GbH2dq',
      role: 'owner'
    },
  });

  const pm = await prisma.user.upsert({
    where: { id: 'user-pm' },
    update: {},
    create: {
      id: 'user-pm',
      name: 'PM',
      email: 'pm@example.com',
      password: '$2b$10$TToBgUlW0lz70sAAZBxyF.cnDQZLSwITS0nkMihoHF3z8s4GbH2dq',
      role: 'project_admin'
    },
  });

  const dev = await prisma.user.upsert({
    where: { id: 'user-dev' },
    update: {},
    create: {
      id: 'user-dev',
      name: 'Developer',
      email: 'dev@example.com',
      password: '$2b$10$TToBgUlW0lz70sAAZBxyF.cnDQZLSwITS0nkMihoHF3z8s4GbH2dq',
      role: 'member'
    },
  });

  // Create project
  const project = await prisma.project.upsert({
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

  // Create project members
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: 'proj-1', userId: 'user-pm' } },
    update: {},
    create: { projectId: 'proj-1', userId: 'user-pm', role: 'project_admin' },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: 'proj-1', userId: 'user-dev' } },
    update: {},
    create: { projectId: 'proj-1', userId: 'user-dev', role: 'member' },
  });

  // Create statuses
  await prisma.status.upsert({
    where: { id: 'todo' },
    update: {},
    create: { id: 'todo', name: 'Todo', order: 1 },
  });

  await prisma.status.upsert({
    where: { id: 'doing' },
    update: {},
    create: { id: 'doing', name: 'Doing', order: 2 },
  });

  await prisma.status.upsert({
    where: { id: 'done' },
    update: {},
    create: { id: 'done', name: 'Done', order: 3 },
  });

  // Create transitions
  await prisma.transition.upsert({
    where: { fromStatusId_toStatusId: { fromStatusId: 'todo', toStatusId: 'doing' } },
    update: {},
    create: { fromStatusId: 'todo', toStatusId: 'doing' },
  });

  await prisma.transition.upsert({
    where: { fromStatusId_toStatusId: { fromStatusId: 'doing', toStatusId: 'todo' } },
    update: {},
    create: { fromStatusId: 'doing', toStatusId: 'todo' },
  });

  await prisma.transition.upsert({
    where: { fromStatusId_toStatusId: { fromStatusId: 'doing', toStatusId: 'done' } },
    update: {},
    create: { fromStatusId: 'doing', toStatusId: 'done' },
  });

  await prisma.transition.upsert({
    where: { fromStatusId_toStatusId: { fromStatusId: 'done', toStatusId: 'doing' } },
    update: {},
    create: { fromStatusId: 'done', toStatusId: 'doing' },
  });

  // Create milestone
  await prisma.milestone.upsert({
    where: { id: 'ms-1' },
    update: {},
    create: {
      id: 'ms-1',
      projectId: 'proj-1',
      name: 'MVP API ready',
      status: 'open',
    },
  });

  // Create sprint
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
