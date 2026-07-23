// @ts-check

/**
 * @typedef {object} AuthTransportOptions
 * @property {string} apiBaseUrl
 * @property {typeof fetch} transportFetch
 * @property {string} accessTokenKey
 * @property {string} refreshTokenKey
 * @property {(key: string) => string | null} readToken
 * @property {(token: string) => boolean} isTokenExpired
 * @property {(token: string) => void} updateAccessToken
 * @property {() => void} invalidateSession
 * @property {string} [origin]
 */

const PUBLIC_AUTH_PATHS = ["/login", "/register", "/refresh"];

/** @param {Request} request */
const isPublicAuthRequest = (request) => {
  const pathname = new URL(request.url).pathname;
  return PUBLIC_AUTH_PATHS.some((path) => pathname.endsWith(path));
};

/**
 * @param {Request} request
 * @param {string} accessToken
 */
const withAccessToken = (request, accessToken) => {
  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  return new Request(request, { headers });
};

/**
 * @param {AuthTransportOptions} options
 * @returns {typeof fetch}
 */
export const createAuthAwareFetch = ({
  apiBaseUrl,
  transportFetch,
  accessTokenKey,
  refreshTokenKey,
  readToken,
  isTokenExpired,
  updateAccessToken,
  invalidateSession,
  origin = globalThis.location?.origin ?? "http://localhost",
}) => {
  /** @type {Promise<string | null> | null} */
  let refreshInFlight = null;

  const resolveRefreshUrl = () => {
    const path = `${apiBaseUrl}/refresh`;
    return /^https?:\/\//i.test(path) ? path : new URL(path, origin).toString();
  };

  const refreshAccessToken = async () => {
    const refreshToken = readToken(refreshTokenKey);
    if (!refreshToken || isTokenExpired(refreshToken)) return null;

    const response = await transportFetch(resolveRefreshUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error(`Session refresh failed (${response.status})`);

    const payload = /** @type {{ accessToken?: unknown }} */ (await response.json());
    if (typeof payload.accessToken !== "string" || !payload.accessToken) {
      throw new Error("Session refresh returned an invalid response");
    }
    updateAccessToken(payload.accessToken);
    return payload.accessToken;
  };

  const getRefreshedAccessToken = () => {
    if (!refreshInFlight) {
      refreshInFlight = refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
    }
    return refreshInFlight;
  };

  return async (input, init) => {
    const request = input instanceof Request ? new Request(input, init) : new Request(input, init);
    if (isPublicAuthRequest(request)) return transportFetch(request);

    const storedAccessToken = readToken(accessTokenKey);
    if (storedAccessToken && isTokenExpired(storedAccessToken)) {
      const refreshedAccessToken = await getRefreshedAccessToken();
      if (!refreshedAccessToken) {
        invalidateSession();
        return transportFetch(request);
      }
      return transportFetch(withAccessToken(request, refreshedAccessToken));
    }

    const response = await transportFetch(request.clone());
    if (response.status !== 401) return response;

    const latestAccessToken = readToken(accessTokenKey);
    if (
      latestAccessToken &&
      latestAccessToken !== storedAccessToken &&
      !isTokenExpired(latestAccessToken)
    ) {
      return transportFetch(withAccessToken(request, latestAccessToken));
    }

    const refreshedAccessToken = await getRefreshedAccessToken();
    if (!refreshedAccessToken) {
      invalidateSession();
      return response;
    }
    return transportFetch(withAccessToken(request, refreshedAccessToken));
  };
};
