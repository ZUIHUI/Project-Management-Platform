import type { Response } from 'express';
import { toErrorResponse } from './errors.js';

export const ok = (res: Response, data: unknown, status = 200, meta?: unknown) =>
  res.status(status).json(meta ? { data, meta } : { data });

export const fail = (res: Response, status: number, error: string, details?: unknown, code?: string) => {
  const normalized = toErrorResponse({ status, message: error, details, code });
  return res.status(normalized.status).json(normalized.body);
};

export const routeParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
