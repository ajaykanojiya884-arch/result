// src/services/authService.js
import api from "./api";

/**
 * Login with userid & password
 * Backend returns JWT token
 */
export const login = async (userid, password) => {
  const res = await api.post("/auth/login", {
    userid,
    password,
  });
  return res.data;
};

/**
 * Get current logged-in user
 */
export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

/**
 * Server-side logout (best effort)
 * Frontend state cleanup is handled by AuthContext
 */
export const logout = async () => {
  try {
    // optional: backend may or may not implement this
    await api.post("/auth/logout");
  } catch {
    // ignore – backend may be restarting
  }
};

/**
 * Refresh JWT token
 * Used by AuthContext timer
 */
export const refreshToken = async () => {
  const res = await api.post("/auth/refresh");
  return res.data;
};
