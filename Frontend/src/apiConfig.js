/**
 * API base URL resolution:
 *  - If REACT_APP_API_URL is explicitly set at build time, use that.
 *  - In local development (localhost / 127.0.0.1), point directly to the
 *    local backend so hot-reload works without docker-compose.
 *  - In any other environment (Hostinger VPS, etc.) use a relative path so
 *    the nginx reverse-proxy in the same container routes to the backend.
 */
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:8000/api";
  }

  // Production: served behind nginx which proxies /api/ → backend:8000
  return "/api";
};

const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;

