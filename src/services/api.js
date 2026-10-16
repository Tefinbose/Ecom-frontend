const API_BASE_URL =
  import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes("localhost:3000")
    ? import.meta.env.VITE_API_URL
    : "/api";

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Normalizes backend image paths and filenames to full URLs.
 * Handles:
 * - full URLs (http/https/blob/data)
 * - /uploads/filename.ext
 * - uploads/filename.ext
 * - raw filenames (e.g. image-12345.png)
 */
export function getImageUrl(path) {
  if (!path) return "";
  const raw = typeof path === "object" ? (path.url || path.src || "") : path;
  if (!raw || typeof raw !== "string" || !raw.trim()) return "";
  const str = raw.trim();

  if (
    str.startsWith("http://") ||
    str.startsWith("https://") ||
    str.startsWith("blob:") ||
    str.startsWith("data:")
  ) {
    return str;
  }
  if (str.startsWith("/uploads/")) {
    return encodeURI(`${BACKEND_URL}${str}`);
  }
  if (str.startsWith("uploads/")) {
    return encodeURI(`${BACKEND_URL}/${str}`);
  }
  return encodeURI(`${BACKEND_URL}/uploads/${str}`);
}

/**
 * Universal API request wrapper with auth header, FormData detection, and JSON error parsing.
 */
export async function apiRequest(endpoint, options = {}) {
  const token =
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminToken");

  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const isFormData = options.body instanceof FormData;

  // Only set application/json when body is NOT FormData
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let body = options.body;
  if (!isFormData && body && typeof body === "object") {
    body = JSON.stringify(body);
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${normalizedEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  const contentType = response.headers.get("content-type");
  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

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
