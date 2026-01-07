import { Router } from "express";
import { randomUUID } from "node:crypto";
import { store } from "../../data/store.js";

const router = Router();

router.get("/files", (req, res) => {
  res.json({ data: store.files });
});

router.post("/files", (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) {
    res.status(400).json({ error: "File name and url are required" });
    return;
  }
  const file = {
    id: randomUUID(),
    name,
    url,
    version: 1,
    createdAt: new Date().toISOString(),
  };
  store.files.unshift(file);
  res.status(201).json({ data: file });
});

export default router;
