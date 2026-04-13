import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import { weeklyReportApi, monthlyReportApi } from "../api/reportsApi.js";
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

const StatTile = ({ label, value, color }) => (
  <div className="bg-parchment rounded-xl px-4 py-3 text-center border border-parchment-dark/30">
    <div className={`text-2xl font-serif font-semibold ${color}`}>{value}</div>
    <div className="text-texts text-xs mt-0.5">{label}</div>
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

const ReportsPage = () => {
  const today = new Date();
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const weeklyBarData = weekly ? [
    { name: "Offices", value: weekly.totals.offices },
    { name: "Prayer", value: weekly.totals.prayerChecks },
    { name: "Sacraments", value: weekly.totals.sacraments },
    { name: "Visits", value: weekly.totals.visits }
  ] : [];

  const pieData = monthly ? [
    { name: "Offices", value: monthly.distribution.offices || 0 },
    { name: "Sacraments", value: monthly.distribution.sacraments || 0 },
    { name: "Visits", value: monthly.distribution.visits || 0 },
    { name: "Admin", value: monthly.distribution.admin || 0 },
    { name: "Teaching", value: monthly.distribution.teaching || 0 }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="min-h-screen bg-parchment">
      <Header date={today} />
      <div className="mx-auto max-w-[640px] px-3 py-4 space-y-3 animate-fadeIn">

        {/* Weekly tiles */}
        <SectionCard title="This Week" icon="📊" loading={loading}>
          {weekly && (
            <>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <StatTile label="Offices" value={weekly.totals.offices} color="text-burgundy" />
                <StatTile label="Prayer" value={weekly.totals.prayerChecks} color="text-burgundy" />
                <StatTile label="Sacraments" value={weekly.totals.sacraments} color="text-navy" />
                <StatTile label="Visits" value={weekly.totals.visits} color="text-forest" />
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyBarData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B6B6B" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(244,239,228,0.8)" }} />
                  <Bar dataKey="value" fill="#5C1A27" radius={[6, 6, 0, 0]} />
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
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 11, color: "#6B6B6B" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : monthly ? (
            <div className="text-center py-6 text-texts text-sm">
              No activity recorded yet this month.
            </div>
          ) : null}
        </SectionCard>

        {/* Prayer streak */}
        {weekly && (
          <div className="bg-gradient-to-r from-burgundy to-burgundy-light rounded-2xl px-5 py-4 text-ivory shadow-nav">
            <div className="text-gold/80 text-xs uppercase tracking-widest mb-1 font-semibold">Weekly Prayer Rule</div>
            <div className="text-3xl font-serif font-semibold">{weekly.totals.prayerChecks}</div>
            <div className="text-ivory/70 text-sm mt-0.5">prayer items completed this week</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
