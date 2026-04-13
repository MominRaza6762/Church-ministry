import React from "react";

const TabNav = ({ tabs, current, onChange }) => {
  return (
    <div className="bg-ivory border-b border-parchment-dark/40 shadow-soft">
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex gap-1.5 px-3 py-2.5 min-w-max">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`
                relative px-4 py-2 text-xs font-semibold whitespace-nowrap
                transition-all duration-200 rounded-xl
                ${current === t.key
                  ? "bg-burgundy text-ivory shadow-md shadow-burgundy/25 scale-[1.03]"
                  : "bg-parchment/80 text-texts border border-parchment-dark/60 hover:bg-parchment-dark hover:border-burgundy/30 hover:text-textp hover:scale-[1.01]"
                }`}
              aria-pressed={current === t.key}
            >
              {current === t.key && (
                <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              )}
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-burgundy/20 to-transparent" />
    </div>
  );
};

export default TabNav;
