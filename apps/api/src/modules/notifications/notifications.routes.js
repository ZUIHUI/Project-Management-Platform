import { Router } from "express";
import { randomUUID } from "node:crypto";
import { store } from "../../data/store.js";

const router = Router();

router.get("/notifications", (req, res) => {
  res.json({ data: store.notifications });
});

router.post("/notifications", (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    res.status(400).json({ error: "Title and message are required" });
    return;
  }
  const notification = {
    id: randomUUID(),
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };
  store.notifications.unshift(notification);
  res.status(201).json({ data: notification });
});

export default router;
