import createClient, { type Middleware } from "openapi-fetch";
import { safeStorage } from "../storage";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearStoredAuthSession,
  isTokenExpired,
  updateStoredAccessToken,
} from "../authSession";
import { createAuthAwareFetch } from "./authTransport";
import { resolveApiBaseUrl } from "./config";
import type { paths } from "./schema";

const apiBaseUrl = resolveApiBaseUrl();
const transportFetch: typeof fetch = globalThis.fetch.bind(globalThis);
const authAwareFetch = createAuthAwareFetch({
  apiBaseUrl,
  transportFetch,
  accessTokenKey: ACCESS_TOKEN_KEY,
  refreshTokenKey: REFRESH_TOKEN_KEY,
  readToken: safeStorage.get,
  isTokenExpired,
  updateAccessToken: updateStoredAccessToken,
  invalidateSession: () => clearStoredAuthSession("expired"),
});

export const apiClient = createClient<paths>({
  baseUrl: apiBaseUrl,
  fetch: authAwareFetch,
});

const authMiddleware: Middleware = {
  onRequest({ request }) {
    const token = safeStorage.get(ACCESS_TOKEN_KEY);
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
};

apiClient.use(authMiddleware);

type OpenApiResult<T> = {
  data?: T;
  error?: unknown;
  response: Response;
};

export class ApiRequestError extends Error {
  readonly response: { status: number; data: unknown };

  constructor(status: number, data: unknown) {
    const message =
      typeof data === "object" && data && "error" in data
        ? ((data as { error?: { message?: string } }).error?.message ?? `Request failed (${status})`)
        : `Request failed (${status})`;
    super(message);
    this.name = "ApiRequestError";
    this.response = { status, data };
  }
}

// Keeps the existing { data, status } service boundary while the transport is
// fully typed by the generated OpenAPI paths.
export const apiRequest = async <T>(operation: Promise<OpenApiResult<T>>) => {
  const result = await operation;
  if (!result.response.ok || result.error !== undefined) {
    throw new ApiRequestError(result.response.status, result.error);
  }
  return { data: result.data as T, status: result.response.status };
};
