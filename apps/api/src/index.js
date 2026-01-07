import http from "node:http";
import { createRouter } from "./server/router.js";
import { notFound, setCorsHeaders } from "./server/response.js";
import { registerRoutes } from "./modules/index.js";

const PORT = process.env.PORT || 3000;
const API_PREFIX = "/api/v1";

const router = createRouter();
registerRoutes(router, API_PREFIX);

const readJsonBody = (req) =>
  new Promise((resolve) => {
    if (req.method === "GET" || req.method === "DELETE") {
      resolve(null);
      return;
    }
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        resolve(null);
      }
    });
  });

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Project Management API",
        version: "v1",
        docs: "See docs/architecture-vision.md for the platform roadmap.",
      })
    );
    return;
  }

  const body = (await readJsonBody(req)) ?? {};
  const handled = await router.handle({ req, res, body, url });
  if (!handled) {
    notFound(res);
  }
});

server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
