import React, { useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import StatsBadge from "../components/StatsBadge.jsx";
import TabNav from "../components/TabNav.jsx";
import LiturgyTab from "../tabs/LiturgyTab.jsx";
import PrayerTab from "../tabs/PrayerTab.jsx";
import SacramentsTab from "../tabs/SacramentsTab.jsx";
import PastoralTab from "../tabs/PastoralTab.jsx";
import AdminTab from "../tabs/AdminTab.jsx";
import TeachingTab from "../tabs/TeachingTab.jsx";
import AdditionalSections from "../tabs/AdditionalSections.jsx";
import { useDailyLog } from "../hooks/useDailyLog.js";
import { useLogStore } from "../store/logStore.js";

const SkeletonCard = () => (
  <div className="bg-ivory rounded-2xl border border-parchment-dark/30 overflow-hidden">
    <div className="px-4 py-3 border-b border-parchment-dark/20">
      <div className="h-4 w-40 skeleton rounded-md" />
      <div className="h-3 w-24 skeleton rounded-md mt-2" />
    </div>
    <div className="px-4 py-4 space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-8 skeleton rounded-xl" />)}
    </div>
  </div>
);

const DashboardPage = () => {
  const { date, log, loading } = useDailyLog(new Date());
  const saved = useLogStore(s => s.saved);

  // Updated tab labels per client:
  // Liturgy → Worship
  // Sacraments → Sacraments & Offices
  // Pastoral → Pastoral Care
  // Teaching → Cont. Formation
  const tabs = useMemo(() => [
    { key: "liturgy",    label: "✝ Worship" },
    { key: "prayer",     label: "♱ Prayer" },
    { key: "sacraments", label: "✠ Sacraments & Offices" },
    { key: "pastoral",   label: "👤 Pastoral Care" },
    { key: "admin",      label: "📋 Admin" },
    { key: "teaching",   label: "🎓 Cont. Formation" },
    { key: "extra",      label: "📅 Schedule" }
  ], []);

  const [current, setCurrent] = useState("liturgy");

  return (
    <div className="min-h-screen bg-parchment">
      <Header date={date} />

      {/* Auto-save indicator */}
      {saved && (
        <div className="fixed top-[60px] right-3 z-[60] animate-slideDown pointer-events-none">
          <div className="bg-success text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-soft flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Saved
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[640px]">
        {/* StatsBadge — normal flow, no z-index */}
        <div className="relative z-0">
          <StatsBadge log={log} />
        </div>

        {/* TabNav sticky — z below modals */}
        <div className="sticky top-14 z-[35]">
          <TabNav tabs={tabs} current={current} onChange={setCurrent} />
        </div>

        <div className="px-3 pt-3 pb-4 space-y-3 animate-fadeIn relative z-0">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {current === "liturgy"    && <LiturgyTab date={date} />}
              {current === "prayer"     && <PrayerTab date={date} />}
              {current === "sacraments" && <SacramentsTab date={date} />}
              {current === "pastoral"   && <PastoralTab date={date} />}
              {current === "admin"      && <AdminTab date={date} />}
              {current === "teaching"   && <TeachingTab date={date} />}
              {current === "extra"      && <AdditionalSections date={date} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
