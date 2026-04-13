import React from "react";
import { useAuthStore } from "../store/authStore.js";
import { friendlyDate } from "../utils/dateUtils.js";

const Header = ({ date }) => {
  const user = useAuthStore(s => s.user);
  return (
    <header className="w-full bg-burgundy">
      <div className="mx-auto max-w-[640px] px-4 py-4 text-center">
        <div className="text-gold/60 text-xs tracking-[0.25em] uppercase mb-1">✝ ✝ ✝</div>
        <div className="text-gold font-serif tracking-[0.18em] uppercase text-sm font-semibold">
          Daily Office Journal
        </div>
        {(user?.name || user?.parishName) && (
          <div className="text-ivory/75 text-xs mt-1">
            {user.name ? `Fr. ${user.name}` : ""}
            {user.name && user.parishName ? " — " : ""}
            {user.parishName || ""}
          </div>
        )}
        <div className="text-gold/80 italic text-xs mt-1">{friendlyDate(date)}</div>
      </div>
    </header>
  );
};

export default Header;
