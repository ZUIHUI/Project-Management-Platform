import express from "express";
import { authService } from "./auth.service.js";
import { fail } from "../shared/http.js";
import { requireAuth } from "../shared/rbac.js";

export const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    if (result.error) {
      return fail(res, result.status ?? 422, result.error);
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Register error:", error);
    return fail(res, 500, "Internal server error");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    if (result.error) {
      return fail(res, result.status ?? 401, result.error);
    }
    return res.json(result);
  } catch (error) {
    console.error("Login error:", error);
    return fail(res, 500, "Internal server error");
  }
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    if (result.error) {
      return fail(res, result.status ?? 401, result.error);
    }
    return res.json(result);
  } catch (error) {
    console.error("Refresh error:", error);
    return fail(res, 500, "Internal server error");
  }
});


authRouter.get("/me", requireAuth, (req, res) => {
  const result = authService.getProfile(req.currentUser?.id);
  if (result.error) {
    return fail(res, result.status ?? 404, result.error);
  }

  return res.json(result);
});

authRouter.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.currentUser?.id, currentPassword, newPassword);
    if (result.error) {
      return fail(res, result.status ?? 422, result.error);
    }

    return res.json(result);
  } catch (error) {
    console.error("Change password error:", error);
    return fail(res, 500, "Internal server error");
  }
});
