import React, { useState } from "react";

const PrayerCard = ({ title, text, featured }) => {
  const [expanded, setExpanded] = useState(featured || false);

  return (
    <div className={`bg-ivory rounded-2xl shadow-card border overflow-hidden transition-all duration-300
      ${featured ? "border-gold/40 shadow-[0_4px_20px_rgba(184,149,42,0.12)]" : "border-parchment-dark/40"}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-parchment/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {featured && (
            <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center flex-shrink-0">
              <span className="text-gold text-sm">✝</span>
            </div>
          )}
          <span className={`font-serif font-semibold ${featured ? "text-burgundy text-base" : "text-burgundy text-sm"}`}>
            {title}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-texts flex-shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 animate-slideDown">
          {featured && <div className="w-16 h-0.5 bg-gold/40 mb-3" />}
          <p className="text-textp text-[15px] leading-[1.8] whitespace-pre-line font-serif italic">
            {text}
          </p>
        </div>
      )}
    </div>
  );
};

export default PrayerCard;
