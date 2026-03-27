import { toErrorResponse } from './errors.js';

export const ok = (res, data, status = 200, meta = undefined) =>
  res.status(status).json(meta ? { data, meta } : { data });

export const fail = (res, status, error, details = undefined, code = undefined) => {
  const normalized = toErrorResponse({ status, message: error, details, code });
  return res.status(normalized.status).json(normalized.body);
};

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
