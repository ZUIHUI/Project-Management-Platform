import { json } from "../../server/response.js";

export const registerHealthRoutes = (router, prefix) => {
  router.get(`${prefix}/health`, ({ res }) => {
    json(res, 200, { status: "ok", timestamp: new Date().toISOString() });
  });
};
