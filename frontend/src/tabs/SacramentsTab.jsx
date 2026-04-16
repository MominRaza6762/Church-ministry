import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import Modal from "../components/Modal.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

// Client changes:
// - Rename to "Sacraments & Occasional Offices"
// - Change title "Sacrament Type" → "Sacrament and Occasional Office Type"
// - Remove "count", add "location" field
// - Merge Baptism + Chrismation → "Baptism/Chrismation"
// - Separate Funeral and Panikhida
// - Add after Marriage: "Conversion"
// - Add before Other: "Slava/Patron Saint", "Grave Blessing", "Moleben"
const SACRAMENT_TYPES = [
  "Holy Confession",
  "Holy Communion (outside Liturgy)",
  "Holy Unction",
  "Baptism/Chrismation",
  "Marriage (Crowning)",
  "Conversion",
  "Funeral",
  "Panikhida",
  "Blessing of a Home/Space",
  "Slava/Patron Saint",
  "Grave Blessing",
  "Moleben",
  "Other"
];

const emptyForm = () => ({
  type: SACRAMENT_TYPES[0],
  recipient: "",
  location: "",
  time: "",
  notes: ""
});

const SacramentsTab = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    setItems(Array.isArray(log?.sacraments) ? log.sacraments : []);
  }, [log?.sacraments]);

  useAutoSave(date, "sacraments", items);

  const add = () => {
    const updated = [...items, { ...form }];
    setItems(updated);
    updateSectionLocal("sacraments", updated);
    setOpen(false);
    setForm(emptyForm());
  };

  const remove = (idx) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    updateSectionLocal("sacraments", updated);
  };

  const inputCls = "border border-parchment-dark rounded-xl px-3 py-2 text-sm bg-parchment focus:bg-white focus:border-gold focus:outline-none transition-all w-full";

  return (
    <div className="space-y-3">
      <LogCard title="✠ Sacraments & Occasional Offices" subtitle={`${items.length} logged`}>
        {items.length === 0 ? (
          <p className="text-texts text-sm py-1">No sacramental ministry logged today</p>
        ) : (
          <div className="space-y-2 mb-3">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-parchment border border-parchment-dark/50 rounded-xl px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-textp text-sm">{it.type}</div>
                  <div className="text-xs text-texts mt-0.5 space-x-2">
                    {it.recipient && <span>{it.recipient}</span>}
                    {it.location && <span>📍 {it.location}</span>}
                    {it.time && <span>🕐 {it.time}</span>}
                  </div>
                  {it.notes && <div className="text-xs text-texts mt-0.5 italic">{it.notes}</div>}
                </div>
                <button onClick={() => remove(idx)} className="w-6 h-6 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setOpen(true)} className="px-4 py-2 bg-burgundy text-ivory rounded-xl text-sm shadow-soft hover:-translate-y-0.5 transition-transform">
          + Log Sacramental Ministry
        </button>
      </LogCard>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Sacramental Ministry"
        actions={
          <>
            <button onClick={() => setOpen(false)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark transition-colors">Cancel</button>
            <button onClick={add} className="px-4 py-2 bg-gold text-white rounded-xl text-sm shadow-soft hover:opacity-90 transition-opacity">Add</button>
          </>
        }>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Sacrament and Occasional Office Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
              {SACRAMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Recipient Name(s)</label>
            <input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} className={inputCls} placeholder="Name(s) of recipient(s)" />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} placeholder="e.g. Hospital, Home, Cemetery, Church..." />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Date/Time</label>
            <input type="datetime-local" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Notes/Follow-up</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} min-h-[90px] resize-none`} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SacramentsTab;
