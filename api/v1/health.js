import { json, methodNotAllowed } from "../_lib/response.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }
  json(res, 200, { status: "ok", timestamp: new Date().toISOString() });
}
