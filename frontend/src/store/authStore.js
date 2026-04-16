import { create } from "zustand";
import { loginApi, logoutApi, meApi } from "../api/authApi.js";
import { registerAuthHandlers } from "../api/http.js";
import API_BASE_URL from "../utils/apiBase.js";
import axios from "axios";

export const useAuthStore = create((set, get) => {
  registerAuthHandlers(
    () => get().accessToken,
    (t) => set({ accessToken: t }),
    () => {
      // Lazy import to avoid circular dep — clear log cache on forced logout
      import("./logStore.js").then(m => m.useLogStore.getState().clearLog()).catch(() => {});
      set({ user: null, accessToken: "", initialized: true });
    }
  );

  return {
    user: null,
    accessToken: "",
    loading: false,
    initialized: false,
    error: "",

    setAccessToken: (t) => set({ accessToken: t }),
    setUser: (u) => set({ user: u }),

    init: async () => {
      if (get().initialized) return;
      try {
        const resp = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = resp.data?.accessToken || "";
        if (newToken) {
          set({ accessToken: newToken });
          const me = await meApi();
          // Clear any stale log from previous session before setting new user
          const { useLogStore } = await import("./logStore.js");
          useLogStore.getState().clearLog();
          set({ user: me.user, initialized: true });
        } else {
          set({ user: null, accessToken: "", initialized: true });
        }
      } catch {
        set({ user: null, accessToken: "", initialized: true });
      }
    },

    login: async (email, password) => {
      set({ loading: true, error: "" });
      try {
        const data = await loginApi({ email, password });
        // Clear stale log cache before loading new user's data
        const { useLogStore } = await import("./logStore.js");
        useLogStore.getState().clearLog();
        set({
          user: data.user,
          accessToken: data.accessToken,
          loading: false,
          initialized: true
        });
        return { ok: true };
      } catch (e) {
        const msg = e?.response?.data?.error || "Login failed";
        set({ error: msg, loading: false });
        return { ok: false, msg };
      }
    },

    logout: async () => {
      try { await logoutApi(); } catch {}
      const { useLogStore } = await import("./logStore.js");
      useLogStore.getState().clearLog();
      set({ user: null, accessToken: "", initialized: true });
    },

    clearAuth: () => {
      import("./logStore.js").then(m => m.useLogStore.getState().clearLog()).catch(() => {});
      set({ user: null, accessToken: "", initialized: true });
    }
  };
});
