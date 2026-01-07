import { randomUUID } from "node:crypto";
import { json, methodNotAllowed } from "../../_lib/response.js";
import { parseBody } from "../../_lib/parseBody.js";
import { store } from "../../_lib/store.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    json(res, 200, { data: store.files });
    return;
  }

  if (req.method === "POST") {
    const body = (await parseBody(req)) ?? {};
    const { name, url } = body;
    if (!name || !url) {
      json(res, 400, { error: "File name and url are required" });
      return;
    }
    const file = {
      id: randomUUID(),
      name,
      url,
      version: 1,
      createdAt: new Date().toISOString(),
    };
    store.files.unshift(file);
    json(res, 201, { data: file });
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
