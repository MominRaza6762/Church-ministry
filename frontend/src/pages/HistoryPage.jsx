import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { historyApi, getLogApi } from "../api/logApi.js";
import { toYYYYMMDD, friendlyDate } from "../utils/dateUtils.js";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  const today = new Date();
  const [dates, setDates] = useState([]);
  const [selected, setSelected] = useState(toYYYYMMDD(today));
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoadingHistory(true);
      try {
        const data = await historyApi();
        setDates(data.dates || []);
      } catch {}
      finally { setLoadingHistory(false); }
    };
    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setLog(null);
      try {
        const data = await getLogApi(selected);
        setLog(data.log || null);
      } catch { setLog(null); }
      finally { setLoading(false); }
    };
    run();
  }, [selected]);

  const hasLog = (d) => {
    const str = toYYYYMMDD(d);
    return dates.includes(str);
  };

  const SummaryRow = ({ label, value, color }) => (
    <div className="flex items-center justify-between py-2 border-b border-parchment-dark/20 last:border-0">
      <span className="text-texts text-sm">{label}</span>
      <span className={`font-semibold text-sm ${color || "text-textp"}`}>{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-parchment">
      <Header date={selected} />
      <div className="mx-auto max-w-[640px] px-3 py-4 space-y-3 animate-fadeIn">

        {/* Calendar card */}
        <div className="bg-ivory rounded-2xl shadow-card border border-parchment-dark/30 overflow-hidden">
          <div className="bg-gradient-to-r from-parchment to-ivory px-5 py-3 border-b border-parchment-dark/30">
            <span className="font-serif text-burgundy text-sm font-semibold">
              {loadingHistory ? "Loading history..." : `${dates.length} days logged`}
            </span>
          </div>
          <div className="px-3 py-3">
            <Calendar
              onChange={(d) => setSelected(toYYYYMMDD(d))}
              value={new Date(selected + "T12:00:00")}
              tileContent={({ date: tileDate }) => (
                <div className="flex justify-center mt-0.5">
                  {hasLog(tileDate) ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* Selected day summary */}
        <div className="bg-ivory rounded-2xl shadow-card border border-parchment-dark/30 overflow-hidden">
          <div className="bg-gradient-to-r from-parchment to-ivory px-5 py-3 border-b border-parchment-dark/30 flex items-center justify-between">
            <span className="font-serif text-burgundy text-sm font-semibold">{friendlyDate(selected)}</span>
            {log && (
              <Link
                to={`/print/${selected}`}
                className="flex items-center gap-1.5 text-xs text-texts hover:text-burgundy transition-colors px-3 py-1 rounded-lg hover:bg-parchment"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / Export
              </Link>
            )}
          </div>
          <div className="px-5 py-4">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-7 skeleton rounded-lg" />
                ))}
              </div>
            ) : log ? (
              <div>
                <SummaryRow
                  label="Liturgical Offices"
                  value={`${Object.values(log.liturgy || {}).filter(v => v?.completed || v?.served).length} / 7`}
                  color="text-burgundy"
                />
                <SummaryRow
                  label="Prayer Rule"
                  value={`${Object.values(log.prayer || {}).filter(v => v === true).length} / 15`}
                  color="text-burgundy"
                />
                <SummaryRow
                  label="Sacraments"
                  value={Array.isArray(log.sacraments) ? log.sacraments.length : 0}
                  color="text-navy"
                />
                <SummaryRow
                  label="Pastoral Visits"
                  value={Array.isArray(log.pastoralVisits) ? log.pastoralVisits.length : 0}
                  color="text-forest"
                />
                <SummaryRow
                  label="Teaching Sessions"
                  value={Array.isArray(log.teaching) ? log.teaching.length : 0}
                  color="text-texts"
                />
                {log.reflections?.gratitude && (
                  <div className="mt-3 bg-parchment rounded-xl px-4 py-3 border border-parchment-dark/30">
                    <div className="text-xs font-semibold text-texts uppercase tracking-wider mb-1">Gratitude</div>
                    <p className="text-textp text-sm italic font-serif">{log.reflections.gratitude}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-4xl animate-float block mb-2">✝</span>
                <p className="text-texts text-sm">No entry for this day</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent activity list */}
        {dates.length > 0 && (
          <div className="bg-ivory rounded-2xl shadow-card border border-parchment-dark/30 overflow-hidden">
            <div className="bg-gradient-to-r from-parchment to-ivory px-5 py-3 border-b border-parchment-dark/30">
              <span className="font-serif text-burgundy text-sm font-semibold">Recent Activity</span>
            </div>
            <div className="divide-y divide-parchment-dark/20">
              {dates.slice(0, 7).map(d => (
                <button
                  key={d}
                  onClick={() => setSelected(d)}
                  className={`w-full px-5 py-3 text-left flex items-center justify-between hover:bg-parchment/50 transition-colors
                    ${selected === d ? "bg-burgundy/5" : ""}`}
                >
                  <span className={`text-sm ${selected === d ? "text-burgundy font-medium" : "text-textp"}`}>
                    {friendlyDate(d)}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-success" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
