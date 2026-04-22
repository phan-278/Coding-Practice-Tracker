// ============================================================
// api.js  —  Base API fetch wrapper
// Tự động gắn JWT token + xử lý lỗi chung
// ============================================================

import { getToken } from "../auth/authService.js";

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api/v1";

/**
 * Wrapper quanh fetch, tự động:
 * - Gắn Authorization header nếu có token
 * - Parse JSON response
 * - Throw error có message từ server nếu status không OK
 * - Redirect về login nếu token hết hạn (401)
 *
 * @param {string} endpoint  - VD: "/problems", "/auth/me"
 * @param {RequestInit} options - fetch options (method, body, headers...)
 * @returns {Promise<any>}
 */
export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Token hết hạn → kick về login
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/pages/auth/login.html";
    throw new Error("Session expired. Please login again.");
  }

  // Parse body (kể cả khi lỗi, để lấy message từ server)
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const err = new Error(data.message || `HTTP ${response.status}`);
    err.status = response.status;
    err.data   = data;
    throw err;
  }

  return data;
}