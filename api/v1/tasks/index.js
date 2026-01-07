import { randomUUID } from "node:crypto";
import { json, methodNotAllowed } from "../../_lib/response.js";
import { parseBody } from "../../_lib/parseBody.js";
import { store } from "../../_lib/store.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    json(res, 200, { data: store.tasks });
    return;
  }

  if (req.method === "POST") {
    const body = (await parseBody(req)) ?? {};
    const { title, projectId, status, priority, dueDate } = body;
    if (!title) {
      json(res, 400, { error: "Task title is required" });
      return;
    }
    const timestamp = new Date().toISOString();
    const task = {
      id: randomUUID(),
      title,
      projectId: projectId ?? null,
      status: status ?? "todo",
      priority: priority ?? "medium",
      dueDate: dueDate ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    store.tasks.unshift(task);
    json(res, 201, { data: task });
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
