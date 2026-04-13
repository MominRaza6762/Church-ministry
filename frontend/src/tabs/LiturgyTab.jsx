import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import ChecklistItem from "../components/ChecklistItem.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

const defaultOffices = [
  { key: "Matins", time: "06:00" },
  { key: "First Hour", time: "07:00" },
  { key: "Third Hour", time: "09:00" },
  { key: "Sixth Hour", time: "12:00" },
  { key: "Ninth Hour", time: "15:00" },
  { key: "Vespers", time: "18:00" },
  { key: "Compline", time: "21:00" },
  { key: "Midnight Office", time: "00:00" },
  { key: "Divine Liturgy", time: "09:30" },
  { key: "Hours Combined", time: "08:00" },
  { key: "Other Service", time: "" }
];

const LiturgyTab = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [state, setState] = useState({});

  useEffect(() => {
    const lit = log?.liturgy || {};
    const map = {};
    for (let i = 0; i < defaultOffices.length; i++) {
      const k = defaultOffices[i].key;
      map[k] = lit[k] || { scheduled: defaultOffices[i].time, served: false, completed: false, actual: "" };
    }
    setState(map);
  }, [log?.liturgy]);

  useAutoSave(date, "liturgy", state);

  const toggle = (k, field) => {
    const v = state[k] || { scheduled: "", served: false, completed: false, actual: "" };
    const updated = { ...state, [k]: { ...v, [field]: !v[field] } };
    setState(updated);
    updateSectionLocal("liturgy", updated);
  };

  const changeTime = (k, field, value) => {
    const v = state[k] || { scheduled: "", served: false, completed: false, actual: "" };
    const updated = { ...state, [k]: { ...v, [field]: value } };
    setState(updated);
    updateSectionLocal("liturgy", updated);
  };

  return (
    <div className="space-y-3">
      <LogCard title="✝ Liturgical Offices" subtitle="Mark served/completed and actual time">
        {defaultOffices.map((o) => {
          const v = state[o.key] || {};
          return (
            <div key={o.key} className="py-2 border-b">
              <div className="flex items-center justify-between">
                <div className="text-textp">{o.key}</div>
                <div className="text-texts text-sm">Scheduled: {o.time}</div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 items-center">
                <ChecklistItem label="Served" checked={v.served || false} onChange={() => toggle(o.key, "served")} />
                <ChecklistItem label="Completed" checked={v.completed || false} onChange={() => toggle(o.key, "completed")} />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-texts">Actual</span>
                  <input
                    type="time"
                    value={v.actual || ""}
                    onChange={(e) => changeTime(o.key, "actual", e.target.value)}
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </LogCard>
    </div>
  );
};

export default LiturgyTab;