import { create } from "zustand";
import { getLogApi, updateSectionApi } from "../api/logApi.js";

let debounceTimer = null;

export const useLogStore = create((set, get) => ({
  date: "",
  log: null,
  loading: false,
  saved: false,
  error: "",

  setDate: (d) => set({ date: d }),

  // Call this on login/logout to clear any cached log data
  clearLog: () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    set({ date: "", log: null, loading: false, saved: false, error: "" });
  },

  fetchLog: async (date) => {
    const current = get().date;
    if (current === date && get().log !== null) return;
    set({ loading: true, error: "", saved: false, date });
    try {
      const data = await getLogApi(date);
      set({ log: data.log || { date }, loading: false });
    } catch (e) {
      set({ error: "Failed to load log", loading: false });
    }
  },

  updateSectionLocal: (section, data) => {
    const log = get().log || {};
    const updated = { ...log, [section]: data };
    set({ log: updated, saved: false });
  },

  autoSave: (date, section, data) => {
    const doSave = async () => {
      try {
        await updateSectionApi(date, section, data);
        set({ saved: true });
        setTimeout(() => set({ saved: false }), 2500);
      } catch {
        set({ error: "Auto-save failed" });
      }
    };
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doSave, 1500);
  }
}));
