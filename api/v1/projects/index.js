import { randomUUID } from "node:crypto";
import { json, methodNotAllowed } from "../../_lib/response.js";
import { parseBody } from "../../_lib/parseBody.js";
import { store } from "../../_lib/store.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    json(res, 200, { data: store.projects });
    return;
  }

  if (req.method === "POST") {
    const body = (await parseBody(req)) ?? {};
    const { name, description, status } = body;
    if (!name) {
      json(res, 400, { error: "Project name is required" });
      return;
    }
    const timestamp = new Date().toISOString();
    const project = {
      id: randomUUID(),
      name,
      description: description ?? "",
      status: status ?? "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    store.projects.unshift(project);
    json(res, 201, { data: project });
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
