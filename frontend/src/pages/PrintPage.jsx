import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLogApi } from "../api/logApi.js";
import { exportPdfApi } from "../api/exportApi.js";
import { useAuthStore } from "../store/authStore.js";
import { friendlyDate } from "../utils/dateUtils.js";
import { toast } from "../components/Toast.jsx";

const Section = ({ title, children }) => (
  <div className="mb-5 print:mb-4">
    <div className="font-serif text-burgundy text-base font-semibold border-b border-burgundy/20 pb-1 mb-2">{title}</div>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex gap-3 py-0.5 text-sm">
    <span className="text-texts min-w-[140px] flex-shrink-0">{label}</span>
    <span className="text-textp">{value || "—"}</span>
  </div>
);

const PrintPage = () => {
  const { date } = useParams();
  const user = useAuthStore(s => s.user);
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await getLogApi(date);
        setLog(data.log || {});
      } catch {}
      finally { setLoading(false); }
    };
    run();
  }, [date]);

  const handlePdfExport = async () => {
    setExporting(true);
    try {
      const blob = await exportPdfApi(date);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Ministry_Log_${date}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch {
      toast.error("PDF export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const liturgyOffices = [
    "Matins", "First Hour", "Third Hour", "Sixth Hour",
    "Ninth Hour", "Vespers", "Compline", "Midnight Office", "Divine Liturgy"
  ];

  const morningPrayer = [
    "Rising prayers", "Psalter reading (Kathisma)", "Daily Scripture",
    "Jesus Prayer (300 reps)", "Akathist/Canon", "Prostrations (12)", "Fasting observed", "Typika / Liturgy of Hours"
  ];
  const eveningPrayer = [
    "Evening prayers read", "Examination of conscience", "Akathist/Canon read",
    "Compline prayed", "Fasting observed", "Prostrations/Metanias", "Scripture reading (NT)"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-texts text-sm animate-pulse">Loading journal entry...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Print controls — hidden when printing */}
      <div className="print:hidden bg-burgundy sticky top-0 z-40 px-4 py-3">
        <div className="mx-auto max-w-[640px] flex items-center justify-between">
          <Link to="/history" className="text-ivory/70 hover:text-ivory text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <span className="text-gold text-xs font-serif">{friendlyDate(date)}</span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-parchment/20 hover:bg-parchment/30 text-ivory text-xs rounded-lg transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={handlePdfExport}
              disabled={exporting}
              className="px-3 py-1.5 bg-gold/80 hover:bg-gold text-ivory text-xs rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              {exporting ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {exporting ? "Exporting..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Print content */}
      <div className="mx-auto max-w-[640px] px-4 py-6 print:px-6 print:py-4 bg-white min-h-screen print:min-h-0 shadow-card print:shadow-none">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-burgundy/20">
          <div className="text-gold text-xs tracking-[0.3em] uppercase font-semibold mb-1">✦ ✦ ✦</div>
          <div className="font-serif text-burgundy text-xl font-semibold tracking-widest uppercase">
            ✝ Daily Office Journal ✝
          </div>
          <div className="text-texts text-sm mt-1">
            {user?.name ? `Fr. ${user.name}` : ""}
            {user?.name && user?.parishName ? " — " : ""}
            {user?.parishName || ""}
          </div>
          <div className="text-gold italic text-sm mt-1">{friendlyDate(date)}</div>
          <div className="text-gold text-xs tracking-[0.3em] mt-1">✦ ✦ ✦</div>
        </div>

        {/* Liturgy */}
        <Section title="✝ Liturgical Offices">
          {liturgyOffices.map(office => {
            const v = log?.liturgy?.[office] || {};
            return (
              <div key={office} className="flex items-center justify-between py-1 border-b border-gray-100 text-sm">
                <span>{office}</span>
                <div className="flex items-center gap-4 text-texts text-xs">
                  <span>{v.served ? "✓ Served" : "○ Served"}</span>
                  <span>{v.completed ? "✓ Completed" : "○ Completed"}</span>
                  <span>{v.actual ? `Actual: ${v.actual}` : ""}</span>
                </div>
              </div>
            );
          })}
        </Section>

        {/* Prayer Rule */}
        <Section title="♱ Personal Rule of Life">
          <div className="mb-2 text-xs font-semibold text-texts uppercase">Morning Rule</div>
          {morningPrayer.map(item => {
            const val = log?.prayer?.[`M:${item}`];
            return <Row key={item} label={item} value={val ? "✓ Complete" : "○ Pending"} />;
          })}
          <div className="mt-2 mb-2 text-xs font-semibold text-texts uppercase">Evening Rule</div>
          {eveningPrayer.map(item => {
            const val = log?.prayer?.[`E:${item}`];
            return <Row key={item} label={item} value={val ? "✓ Complete" : "○ Pending"} />;
          })}
          {log?.prayerNotes && (
            <div className="mt-2 text-sm text-texts">Notes: {log.prayerNotes}</div>
          )}
        </Section>

        {/* Sacraments */}
        <Section title="✠ Sacramental Ministry">
          {Array.isArray(log?.sacraments) && log.sacraments.length > 0 ? (
            log.sacraments.map((s, i) => (
              <div key={i} className="py-1.5 border-b border-gray-100 text-sm">
                <strong>{s.type}</strong> — {s.recipient} (×{s.count})
                {s.time && <span className="text-texts ml-2 text-xs">at {s.time}</span>}
                {s.notes && <div className="text-texts text-xs mt-0.5">{s.notes}</div>}
              </div>
            ))
          ) : <div className="text-texts text-sm">No sacramental ministry logged</div>}
        </Section>

        {/* Pastoral */}
        <Section title="👤 Pastoral Visits & Encounters">
          {Array.isArray(log?.pastoralVisits) && log.pastoralVisits.length > 0 ? (
            log.pastoralVisits.map((v, i) => (
              <div key={i} className="py-1.5 border-b border-gray-100 text-sm">
                <strong>{v.person}</strong> — {v.type}
                {v.time && <span className="text-texts ml-2 text-xs">at {v.time}</span>}
                {v.purpose && <div className="text-texts text-xs">{v.purpose}</div>}
                {v.followUp && <div className="text-danger text-xs">Follow-up required</div>}
              </div>
            ))
          ) : <div className="text-texts text-sm">No pastoral visits logged</div>}
        </Section>

        {/* Admin */}
        <Section title="📋 Administrative & Parish Duties">
          {Object.entries(log?.admin || {}).filter(([k]) => k !== "Notes").map(([task, v]) => (
            <Row key={task} label={task} value={v?.done ? `✓ Done${v.minutes ? ` (${v.minutes} min)` : ""}` : "○ Pending"} />
          ))}
        </Section>

        {/* Teaching */}
        <Section title="🎤 Preaching, Teaching & Catechesis">
          {Array.isArray(log?.teaching) && log.teaching.length > 0 ? (
            log.teaching.map((t, i) => (
              <div key={i} className="py-1.5 border-b border-gray-100 text-sm">
                <strong>{t.topic}</strong> — {t.audience}
                <span className="text-texts ml-2 text-xs">{t.time}, {t.duration} min</span>
                {t.scripture && <div className="text-texts text-xs">Scripture: {t.scripture}</div>}
              </div>
            ))
          ) : <div className="text-texts text-sm">No teaching sessions logged</div>}
        </Section>

        {/* Reflections */}
        {log?.reflections && (
          <Section title="Pastoral Notes, Reflections & Thanksgiving">
            {log.reflections.observations && <Row label="Observations" value={log.reflections.observations} />}
            {log.reflections.gratitude && <Row label="Gratitude" value={log.reflections.gratitude} />}
            {log.reflections.intentions && <Row label="Intentions" value={log.reflections.intentions} />}
            {log.reflections.signed && <div className="text-success text-sm mt-2">✓ Evening examination complete</div>}
          </Section>
        )}

        <div className="text-center mt-6 text-gold text-xs tracking-[0.3em]">✦ ✦ ✦</div>
        <div className="text-center text-texts text-xs mt-1 italic">Built with prayer, for those who serve.</div>
      </div>

      <style>{`
        @media print {
          body { background: #fff !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintPage;
