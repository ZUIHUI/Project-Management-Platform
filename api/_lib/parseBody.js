export const parseBody = (req) =>
  new Promise((resolve) => {
    if (req.method === "GET" || req.method === "DELETE") {
      resolve(null);
      return;
    }
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        resolve(null);
      }
    });
  });
