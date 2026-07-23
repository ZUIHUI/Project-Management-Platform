import { Router } from "express";
import { healthService } from '../../../application/health/health.service.js';
import { fail } from '../httpResponse.js';

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ data: { status: "ok", timestamp: new Date().toISOString() } });
});

router.get('/health/ready', async (_req, res) => {
  const result = await healthService.readiness();
  if (!result.ready) {
    return fail(res, 503, 'Service is not ready', undefined, 'DATABASE_UNAVAILABLE');
  }

  return res.json({ data: { status: 'ready', timestamp: new Date().toISOString() } });
});

export default router;
