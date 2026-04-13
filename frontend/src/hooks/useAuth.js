import { useEffect } from "react";
import { useAuthStore } from "../store/authStore.js";

export const useAuth = () => {
  const initialized = useAuthStore(s => s.initialized);
  const init = useAuthStore(s => s.init);

  useEffect(() => {
    // Call init exactly once — it guards itself with initialized flag
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const user = useAuthStore(s => s.user);
  const loading = useAuthStore(s => s.loading);

  return { user, loading, initialized };
};
