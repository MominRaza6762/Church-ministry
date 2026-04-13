import React, { useMemo } from "react";

const Pill = ({ label, value, color }) => (
  <div className={`flex-1 min-w-0 bg-ivory rounded-xl px-2 py-2.5 text-center shadow-soft border border-parchment-dark/40 transition-all hover:shadow-card`}>
    <div className={`text-lg font-serif font-semibold ${color}`}>{value}</div>
    <div className="text-texts text-[10px] uppercase tracking-wider mt-0.5 truncate">{label}</div>
  </div>
);

const StatsBadge = ({ log }) => {
  const { offices, prayer, sacraments, visits } = useMemo(() => {
    const l = log?.liturgy || {};
    const p = log?.prayer || {};
    let off = 0;
    Object.values(l).forEach(v => {
      if (v && typeof v === "object" && (v.completed === true || v.served === true)) off += 1;
    });
    let pr = 0;
    Object.values(p).forEach(v => { if (v === true) pr += 1; });
    return {
      offices: off,
      prayer: pr,
      sacraments: Array.isArray(log?.sacraments) ? log.sacraments.length : 0,
      visits: Array.isArray(log?.pastoralVisits) ? log.pastoralVisits.length : 0
    };
  }, [log]);

  return (
    <div className="flex gap-2 px-1 py-3 animate-slideDown">
      <Pill label="Offices" value={`${offices}/7`} color="text-burgundy" />
      <Pill label="Prayer" value={`${prayer}/15`} color="text-burgundy" />
      <Pill label="Sacraments" value={sacraments} color="text-navy" />
      <Pill label="Visits" value={visits} color="text-forest" />
    </div>
  );
};

export default StatsBadge;
