import { Router } from "express";
import { db, idFactory } from "../../data/inMemoryDB.js";
import { ok, fail } from "../shared/http.js";

const router = Router();

router.get("/notifications", (req, res) => {
  const { userId } = req.query;
  const data = userId
    ? db.notifications.filter((notification) => notification.userId === userId)
    : db.notifications;

  return ok(res, data);
});

router.post("/notifications", (req, res) => {
  const { userId, type, message } = req.body;
  if (!message) {
    return fail(res, 400, "message is required");
  }

  const notification = {
    id: idFactory("noti"),
    userId: userId ?? null,
    type: type ?? "system",
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(notification);

  return ok(res, notification, 201);
});

router.patch("/notifications/:notificationId/read", (req, res) => {
  const notification = db.notifications.find((item) => item.id === req.params.notificationId);
  if (!notification) {
    return fail(res, 404, "Notification not found");
  }

  notification.read = true;
  notification.readAt = new Date().toISOString();
  return ok(res, notification);
});

export default router;
