// src/context/AuthContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import api from "../services/api";
import {
  logout as apiLogout,
  refreshToken as apiRefreshToken,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!user);

  /* -------------------- Persist user -------------------- */
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  /* -------------------- Refresh timer -------------------- */
  const refreshTimerRef = useRef(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const parseJwt = useCallback((token) => {
    try {
      const payload = token.split(".")[1];
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, []);

  const scheduleRefresh = useCallback(
    (token) => {
      clearRefreshTimer();

      try {
        const payload = parseJwt(token);
        if (!payload || !payload.exp) return;

        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const timeout = Math.max(1000, expiresAt - now - 60 * 1000);

        refreshTimerRef.current = setTimeout(async () => {
          try {
            const res = await apiRefreshToken();
            const newToken = res?.token;
            if (newToken) {
              localStorage.setItem("authToken", newToken);
              scheduleRefresh(newToken);
            }
          } catch {
            // 🔒 IMPORTANT: Do nothing if backend is restarting
          }
        }, timeout);
      } catch {
        // ignore
      }
    },
    [clearRefreshTimer, parseJwt],
  );

  /* -------------------- Initial auth check -------------------- */
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        if (user) {
          // 🔒 Still verify with backend to ensure token is valid & schedule refresh
          const token = localStorage.getItem("authToken");
          if (token) scheduleRefresh(token);
        }

        const res = await api.get("/auth/me");
        if (mounted) setUser(res.data || null);

        const token = localStorage.getItem("authToken");
        if (token) scheduleRefresh(token);
      } catch {
        // not logged in or session expired
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [scheduleRefresh]);

  /* -------------------- LOGIN -------------------- */
  const login = async (data) => {
    if (!data?.token) throw new Error("Missing auth token");

    localStorage.setItem("authToken", data.token);

    const me = await api.get("/auth/me");
    const userObj = {
      ...(me.data || {}),
      role: data.role,
      token: data.token,
    };

    setUser(userObj);
    scheduleRefresh(data.token);
    return userObj;
  };

  /* -------------------- LOGOUT (CRITICAL FIX) -------------------- */
  const logout = async () => {
    // 🔴 HARD STOP all background refresh
    clearRefreshTimer();

    try {
      await apiLogout(); // best effort
    } catch {
      // ignore
    }

    // 🔴 Clear all auth state
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");

    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
  };

  /* -------------------- SAFETY CLEANUP -------------------- */
  useEffect(() => {
    return () => {
      clearRefreshTimer();
    };
  }, [clearRefreshTimer]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
