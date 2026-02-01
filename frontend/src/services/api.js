// src/services/api.js
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL || "";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 8000, // 🔒 IMPORTANT: prevent hanging during backend restart
});

// -------------------- REQUEST INTERCEPTOR --------------------
api.interceptors.request.use((config) => {
  try {
    const path = window.location.pathname;
    const onTeacher = path.startsWith("/teacher");

    const impersonate = sessionStorage.getItem("impersonateToken");
    if (impersonate && onTeacher) {
      config.headers.Authorization = `Bearer ${impersonate}`;
      return config;
    }
  } catch {
    // ignore
  }

  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔒 Cache busting (safe across DB switch)
  if (config.method === "get") {
    config.params = config.params || {};
    config.params._t = Date.now();
  }

  return config;
});

// -------------------- RESPONSE INTERCEPTOR --------------------
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 🔴 Backend restarting / unreachable
    if (!err.response) {
      err.message = "Server restarting, please login again";
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      err.message = "Session expired. Please login again.";
    } else if (err.response?.status === 403) {
      err.message = "You do not have access";
    } else if (err.response?.status === 500) {
      err.message = "Server error";
    } else if (err.response?.data?.error) {
      err.message = err.response.data.error;
    }

    return Promise.reject(err);
  }
);

export default api;
