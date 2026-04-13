import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { toast } from "../components/Toast.jsx";

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const navItems = [
  { to: "/dashboard", label: "Journal", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )},
  { to: "/history", label: "History", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )},
  { to: "/reports", label: "Reports", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )},
  { to: "/prayers", label: "Prayers", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )},
  { to: "/search", label: "Search", icon: <SearchIcon /> },
  { to: "/settings", label: "Settings", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )},
];

// Mobile bottom bar shows 5 items (Journal, History, Search, Prayers, Settings)
const mobileNavItems = [
  navItems[0], // Journal
  navItems[1], // History
  navItems[4], // Search
  navItems[3], // Prayers
  navItems[5], // Settings
];

const AppLayout = () => {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.info("Signed out successfully.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-parchment">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-burgundy shadow-nav">
        <div className="mx-auto max-w-[640px] px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-burgundy-dark/60 border border-gold/40 flex items-center justify-center">
              <span className="text-gold text-sm">✝</span>
            </div>
            <span className="text-gold font-serif tracking-widest uppercase text-xs font-semibold hidden sm:block group-hover:text-gold-light transition-colors">
              Ministry Companion
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                    ${active ? "bg-burgundy-dark text-gold" : "text-ivory/70 hover:text-ivory hover:bg-burgundy-dark/50"}`}>
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            <button onClick={handleLogout}
              className="ml-2 px-3 py-1.5 rounded-lg text-xs font-medium text-ivory/60 hover:text-ivory hover:bg-burgundy-dark/50 transition-all duration-150 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Mobile: search icon + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/search"
              className={`p-1.5 rounded-lg transition-colors ${location.pathname === "/search" ? "text-gold" : "text-ivory/70 hover:text-ivory"}`}>
              <SearchIcon />
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="text-ivory/80 hover:text-ivory p-1 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-burgundy-dark border-t border-burgundy-light/20 animate-slideDown">
            <div className="mx-auto max-w-[640px] px-4 py-2 grid grid-cols-3 gap-1">
              {navItems.map(item => {
                const active = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                    className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-[11px] font-medium transition-all
                      ${active ? "bg-burgundy text-gold" : "text-ivory/70 hover:text-ivory"}`}>
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
              <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-[11px] font-medium text-ivory/50 hover:text-ivory transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom tab bar (mobile) — 5 items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ivory border-t border-parchment-dark shadow-nav">
        <div className="grid grid-cols-5 h-14">
          {mobileNavItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all duration-150
                  ${active ? "text-burgundy" : "text-texts hover:text-burgundy"}`}>
                <div className={`p-1 rounded-lg transition-all ${active ? "bg-burgundy/10" : ""}`}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Page content */}
      <main className="pb-20 md:pb-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;