import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

// Client changes:
// - Remove "Jesus Prayer (300 reps)" → just "Jesus Prayer"
// - Remove "Prostrations (12)" → just "Prostrations"
// - Remove "Typika / Liturgy of Hours" → just "Typika"
// - Evening: "Scripture reading (NT)" → "Daily Scripture"
const morningItems = [
  "Rising prayers",
  "Psalter reading (Kathisma)",
  "Daily Scripture",
  "Jesus Prayer",
  "Akathist/Canon",
  "Prostrations",
  "Fasting observed",
  "Typika"
];
const eveningItems = [
  "Evening prayers read",
  "Examination of conscience",
  "Akathist/Canon read",
  "Compline prayed",
  "Fasting observed",
  "Prostrations/Metanias",
  "Daily Scripture"
];

const buildDefault = () => {
  const out = {};
  morningItems.forEach(it => out[`M:${it}`] = false);
  eveningItems.forEach(it => out[`E:${it}`] = false);
  out["Chapters"] = "";
  out["FastingLevel"] = "";
  return out;
};

const PrayerTab = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [state, setState] = useState(buildDefault());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const pr = log?.prayer || {};
    const merged = buildDefault();
    Object.keys(pr).forEach(k => { merged[k] = pr[k]; });
    setState(merged);
    setNotes(log?.prayerNotes || "");
  }, [log?.prayer, log?.prayerNotes]);

  useAutoSave(date, "prayer", state);
  useAutoSave(date, "prayerNotes", notes);

  const toggle = (k) => {
    const updated = { ...state, [k]: !state[k] };
    setState(updated);
    updateSectionLocal("prayer", updated);
  };

  const onField = (k, val) => {
    const updated = { ...state, [k]: val };
    setState(updated);
    updateSectionLocal("prayer", updated);
  };

  const morningDone = morningItems.filter(it => state[`M:${it}`]).length;
  const eveningDone = eveningItems.filter(it => state[`E:${it}`]).length;

  const inputCls = "border border-parchment-dark rounded-xl px-3 py-2 text-sm bg-parchment focus:bg-white focus:border-gold focus:outline-none transition-all";

  return (
    <div className="space-y-3">
      <LogCard title="♱ Personal Rule of Life" subtitle="Morning and Evening Rule checklist">
        <div className="mt-2">
          <div className="font-serif text-burgundy mb-2">
            Morning Rule ({morningDone}/{morningItems.length})
          </div>
          <div className="space-y-1">
            {morningItems.map((it) => (
              <label key={it} className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
                <div
                  onClick={() => toggle(`M:${it}`)}
                  className={`w-4.5 h-4.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${state[`M:${it}`] ? "bg-burgundy border-burgundy" : "bg-ivory border-parchment-dark"}`}>
                  {state[`M:${it}`] && (
                    <svg className="w-3 h-3 text-ivory" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${state[`M:${it}`] ? "line-through text-texts" : "text-textp"}`}>{it}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="font-serif text-burgundy mb-2">
            Evening Rule ({eveningDone}/{eveningItems.length})
          </div>
          <div className="space-y-1">
            {eveningItems.map((it) => (
              <label key={it} className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
                <div
                  onClick={() => toggle(`E:${it}`)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${state[`E:${it}`] ? "bg-burgundy border-burgundy" : "bg-ivory border-parchment-dark"}`}>
                  {state[`E:${it}`] && (
                    <svg className="w-3 h-3 text-ivory" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${state[`E:${it}`] ? "line-through text-texts" : "text-textp"}`}>{it}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-texts whitespace-nowrap">Chapters of Scripture read</span>
            <input type="text" value={state["Chapters"] || ""} onChange={(e) => onField("Chapters", e.target.value)}
              className={`${inputCls} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-texts whitespace-nowrap">Fasting level today</span>
            <input type="text" value={state["FastingLevel"] || ""} onChange={(e) => onField("FastingLevel", e.target.value)}
              className={`${inputCls} flex-1`} />
          </div>
          <div>
            <div className="text-sm font-medium text-texts mb-1">Prayer Notes</div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              className={`${inputCls} w-full min-h-[100px] resize-none`}
              placeholder="Notes, intentions, thoughts during prayer..." />
          </div>
        </div>
      </LogCard>
    </div>
  );
};

export default PrayerTab;
