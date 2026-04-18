import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header.jsx";
import { weeklyReportApi, monthlyReportApi, weeklyDetailApi } from "../api/reportsApi.js";
import { friendlyDate } from "../utils/dateUtils.js";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#5C1A27", "#B8952A", "#1D3557", "#2D5A1B", "#7a2236"];

const SectionCard = ({ title, icon, children, loading }) => (
  <div className="bg-ivory rounded-2xl shadow-card border border-parchment-dark/30 overflow-hidden">
    <div className="bg-gradient-to-r from-parchment to-ivory px-5 py-3 border-b border-parchment-dark/30 flex items-center gap-2">
      <span>{icon}</span>
      <span className="font-serif text-burgundy text-sm font-semibold">{title}</span>
    </div>
    <div className="px-4 py-4">
      {loading ? (
        <div className="space-y-2">
          <div className="h-5 skeleton rounded-md w-2/3" />
          <div className="h-[180px] skeleton rounded-xl" />
        </div>
      ) : children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ivory border border-parchment-dark rounded-xl px-3 py-2 shadow-card text-xs">
      <div className="font-semibold text-burgundy mb-1">{label}</div>
      <div className="text-textp">{payload[0]?.value ?? 0}</div>
    </div>
  );
};

// Detail modal for a clicked category
const DetailModal = ({ open, onClose, category, detail, loading, dateLabel }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current?.innerHTML || "";
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>${category} Detail</title>
      <style>
        body { font-family: Georgia, serif; color: #1A1A1A; padding: 24px; }
        h1 { color: #5C1A27; font-size: 18px; margin-bottom: 4px; }
        h2 { color: #6B6B6B; font-size: 13px; font-weight: normal; margin-bottom: 16px; }
        .item { border-bottom: 1px solid #e6e0d4; padding: 8px 0; }
        .badge { background: #F4EFE4; padding: 2px 8px; border-radius: 99px; font-size: 11px; }
        .date { color: #5C1A27; font-weight: bold; font-size: 12px; }
        .muted { color: #6B6B6B; font-size: 12px; }
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  if (!open) return null;

  const CATEGORY_LABELS = {
    sacraments: "Sacraments & Occasional Offices",
    visits: "Pastoral Care & Community",
    worship: "Worship Services",
    teaching: "Continuing Formation",
    prayer: "Prayer Rule"
  };

  const items = detail?.items || [];

  const renderItem = (item, idx) => {
    if (category === "sacraments") return (
      <div key={idx} className="py-3 border-b border-parchment-dark/20 last:border-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <span className="text-xs font-semibold text-burgundy uppercase tracking-wide">{item.type}</span>
            <div className="text-sm font-medium text-textp mt-0.5">{item.recipient || "—"}</div>
            <div className="text-xs text-texts mt-0.5 flex gap-3">
              {item.location && <span>📍 {item.location}</span>}
              {item.time && <span>🕐 {item.time}</span>}
            </div>
            {item.notes && <div className="text-xs text-texts/70 italic mt-1">{item.notes}</div>}
          </div>
          <div className="text-xs text-burgundy font-mono flex-shrink-0">{item.date}</div>
        </div>
      </div>
    );

    if (category === "visits") return (
      <div key={idx} className="py-3 border-b border-parchment-dark/20 last:border-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-burgundy">{item.category}</span>
              {item.subcategory && <span className="text-xs text-texts">· {item.subcategory}</span>}
            </div>
            <div className="text-sm font-medium text-textp mt-0.5">{item.person || "—"}</div>
            <div className="text-xs text-texts mt-0.5 flex gap-3">
              {item.time && <span>🕐 {item.time}</span>}
              {item.purpose && <span>· {item.purpose}</span>}
            </div>
            {item.notes && <div className="text-xs text-texts/70 italic mt-1">{item.notes}</div>}
          </div>
          <div className="text-xs text-burgundy font-mono flex-shrink-0">{item.date}</div>
        </div>
      </div>
    );

    if (category === "worship") return (
      <div key={idx} className="py-3 border-b border-parchment-dark/20 last:border-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="text-sm font-medium text-textp">{item.service}</div>
            {item.time && <div className="text-xs text-texts mt-0.5">🕐 {item.time}</div>}
            {item.notes && <div className="text-xs text-texts/70 italic mt-1">{item.notes}</div>}
          </div>
          <div className="text-xs text-burgundy font-mono flex-shrink-0">{item.date}</div>
        </div>
      </div>
    );

    if (category === "teaching") return (
      <div key={idx} className="py-3 border-b border-parchment-dark/20 last:border-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <span className="text-xs font-semibold text-forest uppercase tracking-wide">{item.activityType}</span>
            {item.summary && <div className="text-sm text-textp mt-0.5">{item.summary}</div>}
            {item.notes && <div className="text-xs text-texts/70 italic mt-1">{item.notes}</div>}
          </div>
          <div className="text-xs text-burgundy font-mono flex-shrink-0">{item.date}</div>
        </div>
      </div>
    );

    if (category === "prayer") return (
      <div key={idx} className="py-3 border-b border-parchment-dark/20 last:border-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="text-sm font-medium text-textp">{item.count} items completed</div>
            <div className="text-xs text-texts mt-1 flex flex-wrap gap-1">
              {(item.items || []).map((it, i) => (
                <span key={i} className="px-2 py-0.5 bg-parchment rounded-full text-[10px]">{it}</span>
              ))}
            </div>
          </div>
          <div className="text-xs text-burgundy font-mono flex-shrink-0">{item.date}</div>
        </div>
      </div>
    );

    return null;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-textp/40 backdrop-blur-[2px] animate-fadeIn" onClick={onClose} />
      <div className="relative w-full md:w-[600px] max-w-[640px] bg-ivory md:rounded-2xl rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-slideUp md:animate-slideFade mx-0 md:mx-4">
        {/* Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-parchment-dark rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-parchment-dark/40">
          <div>
            <h3 className="font-serif text-burgundy text-base font-semibold">
              {CATEGORY_LABELS[category] || category}
            </h3>
            <p className="text-texts text-xs mt-0.5">{dateLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-parchment border border-parchment-dark rounded-xl text-xs hover:bg-parchment-dark transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-parchment hover:bg-parchment-dark flex items-center justify-center text-texts hover:text-textp transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[65vh] overflow-y-auto" ref={printRef}>
          {/* Print-only header */}
          <div className="hidden print:block mb-4">
            <h1 style={{ color: "#5C1A27" }}>{CATEGORY_LABELS[category]}</h1>
            <h2>{dateLabel}</h2>
          </div>

          {loading ? (
            <div className="py-8 text-center text-texts text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-4xl mb-3 animate-float">✦</div>
              <p className="text-texts text-sm">No entries recorded this week.</p>
            </div>
          ) : (
            <div>
              <div className="text-xs text-texts mb-3">
                <span className="font-semibold text-textp">{items.length}</span> entr{items.length !== 1 ? "ies" : "y"} this week
              </div>
              {items.map((item, idx) => renderItem(item, idx))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Clickable stat tile
const StatTile = ({ label, value, color, onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 min-w-0 bg-parchment rounded-xl px-3 py-3 text-center border border-parchment-dark/30
      hover:border-gold/60 hover:bg-parchment-dark hover:-translate-y-0.5 transition-all duration-200
      cursor-pointer group shadow-soft"
    title={`Click to view ${label} details`}
  >
    <div className={`text-2xl font-serif font-semibold ${color} group-hover:scale-110 transition-transform`}>
      {value}
    </div>
    <div className="text-texts text-[10px] uppercase tracking-wider mt-0.5 truncate">{label}</div>
    <div className="text-[9px] text-texts/50 mt-0.5">tap to view ›</div>
  </button>
);

const ReportsPage = () => {
  const today = new Date();
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detail modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCategory, setDetailCategory] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [w, m] = await Promise.all([
          weeklyReportApi(today.toISOString()),
          monthlyReportApi(today.toISOString())
        ]);
        setWeekly(w.report);
        setMonthly(m.report);
      } catch {}
      finally { setLoading(false); }
    };
    run();
  }, []);

  const openDetail = async (category) => {
    setDetailCategory(category);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await weeklyDetailApi(today.toISOString(), category);
      setDetail(data.detail);
    } catch {
      setDetail({ items: [] });
    } finally {
      setDetailLoading(false);
    }
  };

  const weeklyBarData = weekly ? [
    { name: "Worship", value: weekly.totals.offices },
    { name: "Prayer", value: weekly.totals.prayerChecks },
    { name: "Sacraments", value: weekly.totals.sacraments },
    { name: "Visits", value: weekly.totals.visits }
  ] : [];

  const pieData = monthly ? [
    { name: "Worship", value: monthly.distribution.offices || 0 },
    { name: "Sacraments", value: monthly.distribution.sacraments || 0 },
    { name: "Visits", value: monthly.distribution.visits || 0 },
    { name: "Admin", value: monthly.distribution.admin || 0 },
    { name: "Formation", value: monthly.distribution.teaching || 0 }
  ].filter(d => d.value > 0) : [];

  const weekLabel = weekly
    ? `${friendlyDate(weekly.range.start)} — ${friendlyDate(weekly.range.end)}`
    : "";

  return (
    <div className="min-h-screen bg-parchment">
      <Header date={today} />
      <div className="mx-auto max-w-[640px] px-3 py-4 space-y-3 animate-fadeIn">

        {/* Weekly clickable tiles */}
        <SectionCard title="This Week" icon="📊" loading={loading}>
          {weekly && (
            <>
              <p className="text-xs text-texts mb-3">
                Tap any tile to see this week's entries in detail.
              </p>
              <div className="flex gap-2 mb-4">
                <StatTile label="Worship"    value={weekly.totals.offices}      color="text-burgundy" onClick={() => openDetail("worship")} />
                <StatTile label="Prayer"     value={weekly.totals.prayerChecks} color="text-burgundy" onClick={() => openDetail("prayer")} />
                <StatTile label="Sacraments" value={weekly.totals.sacraments}   color="text-navy"     onClick={() => openDetail("sacraments")} />
                <StatTile label="Visits"     value={weekly.totals.visits}       color="text-forest"   onClick={() => openDetail("visits")} />
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyBarData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B6B6B" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(244,239,228,0.8)" }} />
                  <Bar dataKey="value" fill="#5C1A27" radius={[6, 6, 0, 0]}
                    onClick={(data) => {
                      const map = { Worship: "worship", Prayer: "prayer", Sacraments: "sacraments", Visits: "visits" };
                      if (map[data.name]) openDetail(map[data.name]);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </SectionCard>

        {/* Monthly distribution */}
        <SectionCard title="Monthly Distribution" icon="📅" loading={loading}>
          {monthly && pieData.length > 0 ? (
            <>
              <div className="text-xs text-texts mb-3">
                {monthly.days.length} active days recorded this month
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 11, color: "#6B6B6B" }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : monthly ? (
            <div className="text-center py-6 text-texts text-sm">No activity recorded yet this month.</div>
          ) : null}
        </SectionCard>

        {/* Prayer streak */}
        {weekly && (
          <button
            onClick={() => openDetail("prayer")}
            className="w-full bg-gradient-to-r from-burgundy to-burgundy-light rounded-2xl px-5 py-4 text-ivory shadow-nav
              hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(92,26,39,0.35)] transition-all duration-200 text-left"
          >
            <div className="text-gold/80 text-xs uppercase tracking-widest mb-1 font-semibold">Weekly Prayer Rule</div>
            <div className="text-3xl font-serif font-semibold">{weekly.totals.prayerChecks}</div>
            <div className="text-ivory/70 text-sm mt-0.5">prayer items completed — tap to view detail ›</div>
          </button>
        )}
      </div>

      {/* Detail modal */}
      <DetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        category={detailCategory}
        detail={detail}
        loading={detailLoading}
        dateLabel={weekLabel}
      />
    </div>
  );
};

export default ReportsPage;