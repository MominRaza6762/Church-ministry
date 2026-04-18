import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import PrintPage from "./pages/PrintPage.jsx";
import PrayersPage from "./pages/PrayersPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import AppLayout from "./pages/AppLayout.jsx";
import { ToastContainer } from "./components/Toast.jsx";
import { useAuth } from "./hooks/useAuth.js";

const AppInner = () => {
  const { initialized } = useAuth();

  if (!initialized) {
    return (
  <div className="min-h-screen bg-parchment flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-burgundy flex items-center justify-center animate-pulse">
        <img
          src="/cross_transparent.png"
          alt="Cross"
          className="w-10 h-10 object-contain"
        />
      </div>
      <div className="text-texts text-sm animate-pulse">
        Loading Ministry Companion...
      </div>
    </div>
  </div>
);
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/print/:date" element={<ProtectedRoute><PrintPage /></ProtectedRoute>} />
        <Route path="/prayers" element={<ProtectedRoute><PrayersPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppInner />
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;