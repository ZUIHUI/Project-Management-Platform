export const ok = (res, data, status = 200) => res.status(status).json({ data });

export const fail = (res, status, error, extra = {}) =>
  res.status(status).json({ error, ...extra });
