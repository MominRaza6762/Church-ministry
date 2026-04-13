import { create } from "zustand";
import { loginApi, logoutApi, meApi } from "../api/authApi.js";
import { registerAuthHandlers } from "../api/http.js";
import API_BASE_URL from "../utils/apiBase.js";
import axios from "axios";

export const useAuthStore = create((set, get) => {
  // Register token handlers with http interceptor (no circular import)
  registerAuthHandlers(
    () => get().accessToken,
    (t) => set({ accessToken: t }),
    // On forced logout (e.g. 401), keep initialized:true so login page shows immediately
    () => set({ user: null, accessToken: "", initialized: true })
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
      // Keep initialized: true so App doesn't show the loading spinner on login page
      set({ user: null, accessToken: "", initialized: true });
    },

    clearAuth: () => {
      set({ user: null, accessToken: "", initialized: true });
    }
  };
});
