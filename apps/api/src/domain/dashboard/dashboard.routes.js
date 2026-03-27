import { Router } from 'express';
import { db } from '../../data/db.js';
import { ok } from '../shared/http.js';

const router = Router();

router.get('/dashboard', async (req, res) => {
  const [issues, statuses, totals] = await Promise.all([
    db.issue.findMany(),
    db.status.findMany(),
    Promise.all([
      db.project.count(),
      db.issue.count(),
      db.notification.count(),
      db.comment.count(),
      db.milestone.count(),
      db.sprint.count(),
    ]),
  ]);

  const openIssues = issues.filter((issue) => issue.statusId !== 'done').map((i) => ({ ...i, dueAt: i.dueDate }));
  const overdueIssues = openIssues.filter((issue) => issue.dueAt && new Date(issue.dueAt).getTime() < Date.now());
  const statusBreakdown = statuses.map((status) => ({
    statusId: status.id,
    count: issues.filter((issue) => issue.statusId === status.id).length,
  }));

  return ok(res, {
    totals: {
      projects: totals[0],
      issues: totals[1],
      notifications: totals[2],
      comments: totals[3],
      milestones: totals[4],
      sprints: totals[5],
    },
    statusBreakdown,
    openIssues,
    overdueIssues,
  });
});

export default router;
