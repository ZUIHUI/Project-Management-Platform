import { Router } from "express";
import { randomUUID } from "node:crypto";

const router = Router();

router.post("/auth/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  res.json({
    data: {
      user: { id: randomUUID(), email },
      accessToken: randomUUID(),
      refreshToken: randomUUID(),
    },
  });
});

router.post("/auth/register", (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  res.status(201).json({
    data: {
      user: { id: randomUUID(), email, name: name ?? "" },
    },
  });
});

export default router;
