import React from "react";

const ChecklistItem = ({ label, checked, onChange, type = "square" }) => {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
      <div
        onClick={onChange}
        className={`flex-shrink-0 transition-all duration-200 flex items-center justify-center
          ${type === "round" ? "w-5 h-5 rounded-full" : "w-5 h-5 rounded-md"}
          ${checked
            ? "bg-burgundy border-burgundy shadow-soft animate-pulseFill"
            : "bg-ivory border-2 border-parchment-dark group-hover:border-burgundy/50"
          } border-2`}
      >
        {checked && (
          <svg className="w-3 h-3 text-ivory" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-sm transition-colors ${checked ? "text-texts line-through" : "text-textp"}`}>
        {label}
      </span>
    </label>
  );
};

export default ChecklistItem;
