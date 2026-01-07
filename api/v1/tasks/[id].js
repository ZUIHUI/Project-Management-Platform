import { json, methodNotAllowed } from "../../_lib/response.js";
import { parseBody } from "../../_lib/parseBody.js";
import { store } from "../../_lib/store.js";

export default async function handler(req, res) {
  const { id } = req.query;
  const task = store.tasks.find((item) => item.id === id);

  if (req.method === "GET") {
    if (!task) {
      json(res, 404, { error: "Task not found" });
      return;
    }
    json(res, 200, { data: task });
    return;
  }

  if (req.method === "PUT") {
    if (!task) {
      json(res, 404, { error: "Task not found" });
      return;
    }
    const body = (await parseBody(req)) ?? {};
    const { title, status, priority, dueDate } = body;
    task.title = title ?? task.title;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate ?? task.dueDate;
    task.updatedAt = new Date().toISOString();
    json(res, 200, { data: task });
    return;
  }

  if (req.method === "DELETE") {
    const index = store.tasks.findIndex((item) => item.id === id);
    if (index === -1) {
      json(res, 404, { error: "Task not found" });
      return;
    }
    const [removed] = store.tasks.splice(index, 1);
    json(res, 200, { data: removed });
    return;
  }

  methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
}
