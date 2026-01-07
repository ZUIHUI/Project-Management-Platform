import { randomUUID } from "node:crypto";
import { json, methodNotAllowed } from "../../_lib/response.js";
import { parseBody } from "../../_lib/parseBody.js";
import { store } from "../../_lib/store.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    json(res, 200, { data: store.notifications });
    return;
  }

  if (req.method === "POST") {
    const body = (await parseBody(req)) ?? {};
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
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
