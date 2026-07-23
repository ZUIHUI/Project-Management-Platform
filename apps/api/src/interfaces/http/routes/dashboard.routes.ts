import { Router } from 'express';
import { dashboardService } from '../../../application/dashboard/dashboard.service.js';
import { ok } from '../httpResponse.js';

const router = Router();

router.get('/dashboard', async (req, res) => ok(res, await dashboardService.get(req.currentUser!)));

export default router;
