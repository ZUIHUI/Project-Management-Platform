import { randomUUID } from "node:crypto";
import { store } from "../../data/store.js";
import { json } from "../../server/response.js";

export const registerTasksRoutes = (router, prefix) => {
  router.get(`${prefix}/tasks`, ({ res }) => {
    json(res, 200, { data: store.tasks });
  });

  router.get(`${prefix}/tasks/:id`, ({ res, params }) => {
    const task = store.tasks.find((item) => item.id === params.id);
    if (!task) {
      json(res, 404, { error: "Task not found" });
      return;
    }
    json(res, 200, { data: task });
  });

  router.post(`${prefix}/tasks`, ({ res, body }) => {
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
  });

  router.put(`${prefix}/tasks/:id`, ({ res, params, body }) => {
    const task = store.tasks.find((item) => item.id === params.id);
    if (!task) {
      json(res, 404, { error: "Task not found" });
      return;
    }
    const { title, status, priority, dueDate } = body;
    task.title = title ?? task.title;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate ?? task.dueDate;
    task.updatedAt = new Date().toISOString();
    json(res, 200, { data: task });
  });

  router.delete(`${prefix}/tasks/:id`, ({ res, params }) => {
    const index = store.tasks.findIndex((item) => item.id === params.id);
    if (index === -1) {
      json(res, 404, { error: "Task not found" });
      return;
    }
    const [removed] = store.tasks.splice(index, 1);
    json(res, 200, { data: removed });
  });
};
