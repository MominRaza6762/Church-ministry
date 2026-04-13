import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore(s => s.user);
  const initialized = useAuthStore(s => s.initialized);

  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
