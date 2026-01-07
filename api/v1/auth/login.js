import { randomUUID } from "node:crypto";
import { json, methodNotAllowed } from "../../_lib/response.js";
import { parseBody } from "../../_lib/parseBody.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }
  const body = (await parseBody(req)) ?? {};
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
}
