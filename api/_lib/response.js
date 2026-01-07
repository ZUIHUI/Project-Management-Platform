export const json = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

export const methodNotAllowed = (res, allowed) => {
  res.setHeader("Allow", allowed.join(", "));
  json(res, 405, { error: "Method Not Allowed" });
};
