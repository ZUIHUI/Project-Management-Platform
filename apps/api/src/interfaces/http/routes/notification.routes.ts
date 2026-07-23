import { Router } from 'express';
import { notificationService } from '../../../application/notification/notification.service.js';
import { fail, ok, routeParam } from '../httpResponse.js';

const router = Router();

router.get('/notifications', async (req, res) =>
  ok(res, await notificationService.list(req.currentUser!)),
);

router.post('/notifications', async (req, res) => {
  const result = await notificationService.create(req.currentUser!, req.body ?? {});
  if (result.error) return fail(res, result.status ?? 422, result.error);
  return ok(res, result.notification, 201);
});

router.patch('/notifications/:notificationId/read', async (req, res) => {
  const result = await notificationService.markRead(req.currentUser!, routeParam(req.params.notificationId));
  if (result.error) return fail(res, result.status ?? 404, result.error);
  return ok(res, result.notification);
});

export default router;
