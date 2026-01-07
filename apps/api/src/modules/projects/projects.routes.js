import { randomUUID } from "node:crypto";
import { store } from "../../data/store.js";
import { json } from "../../server/response.js";

export const registerProjectsRoutes = (router, prefix) => {
  router.get(`${prefix}/projects`, ({ res }) => {
    json(res, 200, { data: store.projects });
  });

  router.get(`${prefix}/projects/:id`, ({ res, params }) => {
    const project = store.projects.find((item) => item.id === params.id);
    if (!project) {
      json(res, 404, { error: "Project not found" });
      return;
    }
    json(res, 200, { data: project });
  });

  router.post(`${prefix}/projects`, ({ res, body }) => {
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
  });

  router.put(`${prefix}/projects/:id`, ({ res, params, body }) => {
    const project = store.projects.find((item) => item.id === params.id);
    if (!project) {
      json(res, 404, { error: "Project not found" });
      return;
    }
    const { name, description, status } = body;
    project.name = name ?? project.name;
    project.description = description ?? project.description;
    project.status = status ?? project.status;
    project.updatedAt = new Date().toISOString();
    json(res, 200, { data: project });
  });

  router.delete(`${prefix}/projects/:id`, ({ res, params }) => {
    const index = store.projects.findIndex((item) => item.id === params.id);
    if (index === -1) {
      json(res, 404, { error: "Project not found" });
      return;
    }
    const [removed] = store.projects.splice(index, 1);
    json(res, 200, { data: removed });
  });
};
