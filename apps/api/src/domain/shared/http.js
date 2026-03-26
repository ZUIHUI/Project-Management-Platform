export const ok = (res, data, status = 200, meta = undefined) =>
  res.status(status).json(meta ? { data, meta } : { data });

export const fail = (res, status, error, extra = {}) =>
  res.status(status).json({
    error: {
      message: error,
      status,
      ...extra,
    },
  });
