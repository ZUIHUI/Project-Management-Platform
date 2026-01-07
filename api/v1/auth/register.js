import { randomUUID } from "node:crypto";
import { json, methodNotAllowed } from "../../_lib/response.js";
import { parseBody } from "../../_lib/parseBody.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }
  const body = (await parseBody(req)) ?? {};
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
}
