import { randomUUID } from "node:crypto";
import { store } from "../../data/store.js";
import { json } from "../../server/response.js";

export const registerFilesRoutes = (router, prefix) => {
  router.get(`${prefix}/files`, ({ res }) => {
    json(res, 200, { data: store.files });
  });

  router.post(`${prefix}/files`, ({ res, body }) => {
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
  });
};
