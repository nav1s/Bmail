import { getToken } from "../utils/tokenUtils";
const BASE_URL = "http://localhost:8080/api";

/**
 * Unified API utility for sending HTTP requests.
 * Automatically handles JSON and FormData payloads.
 *
 * Supports:
 * - GET, POST, PATCH, DELETE
 * - Automatic header injection for JSON
 * - Skips stringification for FormData
 */
async function request(endpoint, method = "GET", body = null) {
  const isFormData = body instanceof FormData;

  const headers = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    credentials: "include", // For cookie-based sessions
    body: body ? (isFormData ? body : JSON.stringify(body)) : null,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
}

export default {
  get: (url) => request(url, "GET"),
  post: (url, data) => request(url, "POST", data),
  patch: (url, data) => request(url, "PATCH", data),
  delete: (url) => request(url, "DELETE"),
};
