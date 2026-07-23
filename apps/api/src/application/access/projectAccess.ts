import type { Prisma } from '@prisma/client';
import type { AuthenticatedUser, ProjectAccessMode } from '../../domain/access/accessPolicy.js';
import { isPlatformAdmin, memberCan } from '../../domain/access/accessPolicy.js';
import { db } from '../../infrastructure/persistence/index.js';

export const accessibleProjectWhere = (actor: AuthenticatedUser): Prisma.ProjectWhereInput =>
  isPlatformAdmin(actor.role)
    ? {}
    : {
        OR: [{ ownerId: actor.id }, { members: { some: { userId: actor.id } } }],
      };

export const canAccessProject = async (
  actor: AuthenticatedUser,
  projectId: string,
  mode: ProjectAccessMode,
) => {
  if (isPlatformAdmin(actor.role)) return true;
  const project = await db.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
  if (!project) return false;
  if (project.ownerId === actor.id) return true;

  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
    select: { role: true },
  });
  return member ? memberCan(member.role, mode) : false;
};

export const resolveProjectIdFromIssue = async (issueId: string) => {
  const issue = await db.issue.findUnique({ where: { id: issueId }, select: { projectId: true } });
  return issue?.projectId ?? null;
};
