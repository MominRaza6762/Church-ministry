import React from "react";

const LogCard = ({ title, subtitle, children, right }) => {
  return (
    <div className="bg-ivory rounded-2xl shadow-card border border-parchment-dark/30 overflow-hidden animate-slideUp">
      {/* Card header */}
      <div className="bg-gradient-to-r from-parchment to-ivory px-4 py-3 border-b border-parchment-dark/30 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-serif text-burgundy text-sm font-semibold truncate">{title}</div>
          {subtitle ? (
            <div className="text-texts text-xs mt-0.5">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="flex-shrink-0">{right}</div> : null}
      </div>
      {/* Card body */}
      <div className="px-4 py-3">{children}</div>
    </div>
  );
};

export default LogCard;
