import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

const tasks = [
  "Parish correspondence","Council meeting prep","Sunday bulletin preparation","Stewardship follow-up","Financial records","Cemetery administration","Diocese reports","Facility/maintenance"
];

const AdminTab = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [state, setState] = useState({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const a = log?.admin || {};
    const m = {};
    for (let i = 0; i < tasks.length; i++) {
      m[tasks[i]] = a[tasks[i]] || { done: false, minutes: 0 };
    }
    m["Notes"] = a["Notes"] || "";
    setState(m);
    setNotes(a["Notes"] || "");
  }, [log?.admin]);

  useAutoSave(date, "admin", state);

  const toggle = (k) => {
    const v = state[k] || { done: false, minutes: 0 };
    const u = { ...state, [k]: { ...v, done: !v.done } };
    setState(u);
    updateSectionLocal("admin", u);
  };
  const timeChange = (k, minutes) => {
    const v = state[k] || { done: false, minutes: 0 };
    const u = { ...state, [k]: { ...v, minutes: Number(minutes) || 0 } };
    setState(u);
    updateSectionLocal("admin", u);
  };
  const notesChange = (t) => {
    const u = { ...state, Notes: t };
    setState(u);
    setNotes(t);
    updateSectionLocal("admin", u);
  };

  return (
    <div className="space-y-3">
      <LogCard title="📋 Administrative & Parish Duties" subtitle="Track tasks and time spent">
        <div className="grid gap-2">
          {tasks.map((t) => {
            const v = state[t] || { done: false, minutes: 0 };
            return (
              <div key={t} className="flex items-center justify-between border-b py-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 accent-gold" checked={v.done} onChange={() => toggle(t)} />
                  <span>{t}</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-texts">Minutes</span>
                  <input type="number" min="0" value={v.minutes} onChange={(e) => timeChange(t, e.target.value)} className="w-20 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
              </div>
            );
          })}
          <div className="mt-2">
            <div className="text-sm text-texts">Additional Notes</div>
            <textarea value={notes} onChange={(e) => notesChange(e.target.value)} className="w-full border rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold min-h-[100px]" />
          </div>
        </div>
      </LogCard>
    </div>
  );
};

export default AdminTab;