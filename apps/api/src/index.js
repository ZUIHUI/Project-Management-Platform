import express from "express";
import cors from "cors";
import { routes } from "./modules/index.js";

const PORT = process.env.PORT || 4000;
const API_PREFIX = "/api/v1";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Project Management API",
    version: "v1",
    docs: "See docs/architecture-vision.md for the platform roadmap.",
  });
});

for (const route of routes) {
  app.use(API_PREFIX, route);
}

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
