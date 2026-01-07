const splitPath = (path) => path.split("/").filter(Boolean);

export const createRouter = () => {
  const routes = [];

  const add = (method, path, handler) => {
    routes.push({
      method: method.toUpperCase(),
      path,
      segments: splitPath(path),
      handler,
    });
  };

  const match = (method, pathname) => {
    const segments = splitPath(pathname);
    for (const route of routes) {
      if (route.method !== method.toUpperCase()) {
        continue;
      }
      if (route.segments.length !== segments.length) {
        continue;
      }
      const params = {};
      let matched = true;
      for (let index = 0; index < route.segments.length; index += 1) {
        const routeSegment = route.segments[index];
        const pathSegment = segments[index];
        if (routeSegment.startsWith(":")) {
          params[routeSegment.slice(1)] = decodeURIComponent(pathSegment);
          continue;
        }
        if (routeSegment !== pathSegment) {
          matched = false;
          break;
        }
      }
      if (matched) {
        return { handler: route.handler, params };
      }
    }
    return null;
  };

  const handle = async ({ req, res, body, url }) => {
    const matchResult = match(req.method, url.pathname);
    if (!matchResult) {
      return false;
    }
    await matchResult.handler({
      req,
      res,
      body,
      params: matchResult.params,
      query: Object.fromEntries(url.searchParams.entries()),
    });
    return true;
  };

  return {
    add,
    get: (path, handler) => add("GET", path, handler),
    post: (path, handler) => add("POST", path, handler),
    put: (path, handler) => add("PUT", path, handler),
    delete: (path, handler) => add("DELETE", path, handler),
    handle,
  };
};
