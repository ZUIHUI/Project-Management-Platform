import { Router } from 'express';
import { db, idFactory } from '../../data/db.js';
import { ok, fail } from '../shared/http.js';

const router = Router();

router.get('/notifications', async (req, res) => {
  const { userId } = req.query;
  const data = await db.notification.findMany({ where: userId ? { userId: `${userId}` } : undefined, orderBy: { createdAt: 'desc' } });
  return ok(res, data.map((n) => ({ ...n, payload: n.message })));
});

router.post('/notifications', async (req, res) => {
  const { userId, type, message, payload } = req.body;
  if (!message && !payload) return fail(res, 422, 'message or payload is required');
  if (!userId) return fail(res, 422, 'userId is required');

  const notification = await db.notification.create({
    data: {
      id: idFactory('noti'),
      userId,
      type: type ?? 'system',
      message: message ?? JSON.stringify(payload),
      read: false,
    },
  });

  return ok(res, { ...notification, payload: notification.message }, 201);
});

router.patch('/notifications/:notificationId/read', async (req, res) => {
  const notification = await db.notification.findUnique({ where: { id: req.params.notificationId } });
  if (!notification) return fail(res, 404, 'Notification not found');

  const updated = await db.notification.update({ where: { id: req.params.notificationId }, data: { read: true } });
  return ok(res, { ...updated, payload: updated.message });
});

export default router;
