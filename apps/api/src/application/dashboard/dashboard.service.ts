import { accessibleProjectWhere } from '../access/projectAccess.js';
import type { AuthenticatedUser } from '../../domain/access/accessPolicy.js';
import { db } from '../../infrastructure/persistence/index.js';

const presentDashboardIssue = (record) => {
  const { project, dueDate, ...issue } = record;
  return {
    ...issue,
    dueAt: dueDate,
    projectKey: project.key,
    projectName: project.name,
  };
};

export const dashboardService = {
  async get(actor: AuthenticatedUser) {
    const projectWhere = accessibleProjectWhere(actor);
    const issueWhere = { project: { is: projectWhere } };
    const [issues, statuses, totals] = await Promise.all([
      db.issue.findMany({
        where: issueWhere,
        include: { project: { select: { key: true, name: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
      db.status.findMany({ orderBy: { order: 'asc' } }),
      Promise.all([
        db.project.count({ where: projectWhere }),
        db.issue.count({ where: issueWhere }),
        db.notification.count({ where: { userId: actor.id, read: false } }),
        db.comment.count({ where: { issue: issueWhere } }),
        db.milestone.count({ where: { project: { is: projectWhere } } }),
        db.sprint.count({ where: { project: { is: projectWhere } } }),
      ]),
    ]);

    const openIssues = issues
      .filter((issue) => issue.statusId !== 'done')
      .map(presentDashboardIssue);
    const overdueIssues = openIssues.filter(
      (issue) => issue.dueAt && new Date(issue.dueAt).getTime() < Date.now(),
    ).sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime());

    return {
      totals: {
        projects: totals[0],
        issues: totals[1],
        notifications: totals[2],
        comments: totals[3],
        milestones: totals[4],
        sprints: totals[5],
      },
      statusBreakdown: statuses.map((status) => ({
        statusId: status.id,
        statusName: status.name,
        count: issues.filter((issue) => issue.statusId === status.id).length,
      })),
      openIssues,
      overdueIssues,
    };
  },
};
