import { Router } from "express";
import { issueService } from "../../domain/issue/issue.service.js";
import { ok } from "../../domain/shared/http.js";

const router = Router();

// Compatibility facade: keep legacy /tasks endpoint alive.
router.get("/tasks", (req, res) => {
  res.set("Deprecation", "true");
  res.set("Sunset", "2026-12-31");
  return ok(res, issueService.legacyTasks());
});

export default router;
