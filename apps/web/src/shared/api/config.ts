export const resolveApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  return configured ? configured.replace(/\/$/, "") : "/api/v1";
};
