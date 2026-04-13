import React from "react";

const TimeInput = ({ value, onChange, label }) => {
  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-xs text-texts whitespace-nowrap">{label}</span>}
      <input
        type="time"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="border border-parchment-dark rounded-lg px-2 py-1 text-xs bg-parchment
          focus:bg-white focus:border-gold focus:ring-0 transition-all duration-200 w-[90px]"
      />
    </div>
  );
};

export default TimeInput;
