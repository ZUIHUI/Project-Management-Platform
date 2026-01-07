import { randomUUID } from "node:crypto";
import { json } from "../../server/response.js";

export const registerAuthRoutes = (router, prefix) => {
  router.post(`${prefix}/auth/login`, ({ res, body }) => {
    const { email } = body;
    if (!email) {
      json(res, 400, { error: "Email is required" });
      return;
    }
    json(res, 200, {
      data: {
        user: { id: randomUUID(), email },
        accessToken: randomUUID(),
        refreshToken: randomUUID(),
      },
    });
  });

  router.post(`${prefix}/auth/register`, ({ res, body }) => {
    const { email, name } = body;
    if (!email) {
      json(res, 400, { error: "Email is required" });
      return;
    }
    json(res, 201, {
      data: {
        user: { id: randomUUID(), email, name: name ?? "" },
      },
    });
  });
};
