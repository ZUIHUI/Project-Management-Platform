import { json, methodNotAllowed } from "../../_lib/response.js";
import { parseBody } from "../../_lib/parseBody.js";
import { store } from "../../_lib/store.js";

export default async function handler(req, res) {
  const { id } = req.query;
  const project = store.projects.find((item) => item.id === id);

  if (req.method === "GET") {
    if (!project) {
      json(res, 404, { error: "Project not found" });
      return;
    }
    json(res, 200, { data: project });
    return;
  }

  if (req.method === "PUT") {
    if (!project) {
      json(res, 404, { error: "Project not found" });
      return;
    }
    const body = (await parseBody(req)) ?? {};
    const { name, description, status } = body;
    project.name = name ?? project.name;
    project.description = description ?? project.description;
    project.status = status ?? project.status;
    project.updatedAt = new Date().toISOString();
    json(res, 200, { data: project });
    return;
  }

  if (req.method === "DELETE") {
    const index = store.projects.findIndex((item) => item.id === id);
    if (index === -1) {
      json(res, 404, { error: "Project not found" });
      return;
    }
    const [removed] = store.projects.splice(index, 1);
    json(res, 200, { data: removed });
    return;
  }

  methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
}
