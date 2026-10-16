// Base server URL fetched from frontend .env
export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

// Standardized API root and backend origin
export const API_BASE_URL = SERVER_URL.endsWith("/api")
  ? SERVER_URL
  : `${SERVER_URL}/api`;

export const BACKEND_URL = SERVER_URL.replace(/\/api$/, "");

/**
 * Normalizes backend image paths to full URLs
 */
export function getImageUrl(path) {
  if (!path) return "";
  const raw = typeof path === "object" ? path.url || path.src || "" : path;
  if (!raw || typeof raw !== "string") return "";
  const str = raw.trim();

  if (
    str.startsWith("http://") ||
    str.startsWith("https://") ||
    str.startsWith("blob:") ||
    str.startsWith("data:")
  ) {
    return str;
  }
  return encodeURI(`${BACKEND_URL}/uploads/${str.replace(/^\/?(uploads\/)?/, "")}`);
}

/**
 * Universal API request wrapper: handles tokens, JSON/FormData, and clean error messages
 */
export async function apiRequest(endpoint, options = {}) {
  const token =
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminToken");

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const body =
    !isFormData && options.body && typeof options.body === "object"
      ? JSON.stringify(options.body)
      : options.body;

  const cleanEndpoint = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}/${endpoint.replace(/^\/?(api\/)?/, "")}`;

  const response = await fetch(cleanEndpoint, {
    ...options,
    headers,
    body,
  });

  const contentType = response.headers.get("content-type");
  const data =
    contentType && contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      response.statusText ||
      `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiRequest;
