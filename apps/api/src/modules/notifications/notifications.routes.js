import { randomUUID } from "node:crypto";
import { store } from "../../data/store.js";
import { json } from "../../server/response.js";

export const registerNotificationsRoutes = (router, prefix) => {
  router.get(`${prefix}/notifications`, ({ res }) => {
    json(res, 200, { data: store.notifications });
  });

  router.post(`${prefix}/notifications`, ({ res, body }) => {
    const { title, message } = body;
    if (!title || !message) {
      json(res, 400, { error: "Title and message are required" });
      return;
    }
    const notification = {
      id: randomUUID(),
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    store.notifications.unshift(notification);
    json(res, 201, { data: notification });
  });
};
