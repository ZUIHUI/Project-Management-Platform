import { Router } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specPath = [
  path.resolve(__dirname, "../../../../openapi/openapi.yaml"),
  path.resolve(process.cwd(), "openapi/openapi.yaml"),
  path.resolve(process.cwd(), "apps/api/openapi/openapi.yaml"),
].find(existsSync);

router.get("/openapi.yaml", (req, res) => {
  if (!specPath) return res.status(503).json({ error: { message: "OpenAPI document unavailable", status: 503 } });
  res.sendFile(specPath);
});

export default router;
