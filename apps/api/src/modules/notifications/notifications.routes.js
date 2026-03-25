import { Router } from "express";
import { randomUUID } from "node:crypto";
import { store } from "../../data/store.js";

const router = Router();

router.get("/notifications", (req, res) => {
  const userId = req.query.userId;
  const data = userId
    ? store.notifications.filter((notification) => notification.userId === userId)
    : store.notifications;

  res.json({ data });
});

router.post("/notifications", (req, res) => {
  const { userId, type, title, message } = req.body;
  if (!title || !message) {
    res.status(400).json({ error: "title and message are required" });
    return;
  }

  const notification = {
    id: randomUUID(),
    userId: userId ?? null,
    type: type ?? "system",
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };

  store.notifications.unshift(notification);
  res.status(201).json({ data: notification });
});

export default router;
