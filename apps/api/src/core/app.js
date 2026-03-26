import express from "express";
import cors from "cors";
import { API_PREFIX } from "../config/constants.js";
import healthRoutes from "../domain/health/health.routes.js";
import projectRoutes from "../domain/project/project.routes.js";
import issueRoutes from "../domain/issue/issue.routes.js";
import dashboardRoutes from "../domain/dashboard/dashboard.routes.js";
import notificationRoutes from "../domain/notification/notification.routes.js";

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({
      message: "Project Management API - strict refactor baseline",
      version: "v2-alpha",
    });
  });

  app.use(API_PREFIX, healthRoutes);
  app.use(API_PREFIX, projectRoutes);
  app.use(API_PREFIX, issueRoutes);
  app.use(API_PREFIX, dashboardRoutes);
  app.use(API_PREFIX, notificationRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  return app;
};
