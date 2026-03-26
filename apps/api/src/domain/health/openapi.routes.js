import { Router } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specPath = path.resolve(__dirname, "../../../openapi/openapi.yaml");

router.get("/openapi.yaml", (req, res) => {
  res.sendFile(specPath);
});

export default router;
