import express from 'express';
import { authService } from './auth.service.js';
import { fail } from '../shared/http.js';
import { requireAuth } from '../shared/rbac.js';

export const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await authService.register({ name, email, password, role });
  if (result.error) return fail(res, result.status ?? 422, result.error);
  return res.status(201).json(result);
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  if (result.error) return fail(res, result.status ?? 401, result.error);
  return res.json(result);
});

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);
  if (result.error) return fail(res, result.status ?? 401, result.error);
  return res.json(result);
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const result = await authService.getProfile(req.currentUser?.id);
  if (result.error) return fail(res, result.status ?? 404, result.error);
  return res.json(result);
});

authRouter.put('/me', requireAuth, async (req, res) => {
  const result = await authService.updateProfile(req.currentUser?.id, req.body ?? {});
  if (result.error) return fail(res, result.status ?? 422, result.error);
  return res.json(result);
});

authRouter.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.currentUser?.id, currentPassword, newPassword);
  if (result.error) return fail(res, result.status ?? 422, result.error);
  return res.json(result);
});
