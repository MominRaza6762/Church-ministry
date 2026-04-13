import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

const morningItems = [
  "Rising prayers","Psalter reading (Kathisma)","Daily Scripture","Jesus Prayer (300 reps)","Akathist/Canon","Prostrations (12)","Fasting observed","Typika / Liturgy of Hours"
];
const eveningItems = [
  "Evening prayers read","Examination of conscience","Akathist/Canon read","Compline prayed","Fasting observed","Prostrations/Metanias","Scripture reading (NT)"
];

const buildDefault = () => {
  const out = {};
  for (let i = 0; i < morningItems.length; i++) out[`M:${morningItems[i]}`] = false;
  for (let i = 0; i < eveningItems.length; i++) out[`E:${eveningItems[i]}`] = false;
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
    const keys = Object.keys(pr);
    for (let i = 0; i < keys.length; i++) merged[keys[i]] = pr[keys[i]];
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

  return (
    <div className="space-y-3">
      <LogCard title="♱ Personal Rule of Life" subtitle="Morning and Evening Rule checklist">
        <div className="mt-2">
          <div className="font-serif text-burgundy">Morning Rule (0/8)</div>
          {morningItems.map((it) => (
            <label key={it} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                className="w-4 h-4 accent-gold"
                checked={state[`M:${it}`] || false}
                onChange={() => toggle(`M:${it}`)}
              />
              <span>{it}</span>
            </label>
          ))}
        </div>
        <div className="mt-3">
          <div className="font-serif text-burgundy">Evening Rule (0/7)</div>
          {eveningItems.map((it) => (
            <label key={it} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                className="w-4 h-4 accent-gold"
                checked={state[`E:${it}`] || false}
                onChange={() => toggle(`E:${it}`)}
              />
              <span>{it}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 grid gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-texts">Chapters of Scripture read</span>
            <input
              type="text"
              value={state["Chapters"] || ""}
              onChange={(e) => onField("Chapters", e.target.value)}
              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-texts">Fasting level today</span>
            <input
              type="text"
              value={state["FastingLevel"] || ""}
              onChange={(e) => onField("FastingLevel", e.target.value)}
              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold flex-1"
            />
          </div>
          <div>
            <div className="text-sm text-texts">Prayer Notes</div>
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); }}
              className="w-full border rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold min-h-[100px]"
            />
          </div>
        </div>
      </LogCard>
    </div>
  );
};

export default PrayerTab;