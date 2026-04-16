import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import Modal from "../components/Modal.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

// Client spec: log layout = place / time spent / purpose-needs / follow-up / notes
const ADMIN_CATEGORIES = [
  "Parish Correspondence (letters/emails/follow-ups)",
  "Diocese Correspondence (letters/emails/follow-ups)",
  "Certificates & Records",
  "Bulletin Preparation (weekly/monthly/annually)",
  "Archives & Parish Library",
  "Financial Records",
  "Social Media & Website"
];

const emptyForm = () => ({
  category: ADMIN_CATEGORIES[0],
  place: "",
  timeSpent: "",
  purpose: "",
  followUp: "",
  notes: ""
});

const AdminTab = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    // Support both old object format and new array format
    const raw = log?.admin;
    if (Array.isArray(raw)) {
      setItems(raw);
    } else {
      setItems([]);
    }
  }, [log?.admin]);

  useAutoSave(date, "admin", items);

  const add = () => {
    const updated = [...items, { ...form }];
    setItems(updated);
    updateSectionLocal("admin", updated);
    setOpen(false);
    setForm(emptyForm());
  };

  const remove = (idx) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    updateSectionLocal("admin", updated);
  };

  const inputCls = "border border-parchment-dark rounded-xl px-3 py-2 text-sm bg-parchment focus:bg-white focus:border-gold focus:outline-none transition-all w-full";

  return (
    <div className="space-y-3">
      <LogCard title="📋 Administration" subtitle={`${items.length} logged`}>
        {items.length === 0 ? (
          <p className="text-texts text-sm py-1">No administrative tasks logged today</p>
        ) : (
          <div className="space-y-2 mb-3">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-parchment border border-parchment-dark/50 rounded-xl px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-textp text-sm">{it.category}</div>
                  <div className="text-xs text-texts mt-0.5 flex flex-wrap gap-x-3">
                    {it.place && <span>📍 {it.place}</span>}
                    {it.timeSpent && <span>⏱ {it.timeSpent}</span>}
                  </div>
                  {it.purpose && <div className="text-xs text-texts mt-0.5">{it.purpose}</div>}
                  {it.followUp && <div className="text-xs text-danger mt-0.5">Follow-up: {it.followUp}</div>}
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
          + Log Administrative Task
        </button>
      </LogCard>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Administrative Task"
        actions={
          <>
            <button onClick={() => setOpen(false)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark transition-colors">Cancel</button>
            <button onClick={add} className="px-4 py-2 bg-gold text-white rounded-xl text-sm shadow-soft hover:opacity-90 transition-opacity">Add</button>
          </>
        }>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
              {ADMIN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Place</label>
            <input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} className={inputCls} placeholder="e.g. Office, Church, Home..." />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Time Spent</label>
            <input value={form.timeSpent} onChange={(e) => setForm({ ...form, timeSpent: e.target.value })} className={inputCls} placeholder="e.g. 30 min, 1 hr..." />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Purpose/Needs</label>
            <textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className={`${inputCls} min-h-[70px] resize-none`} />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Follow-up</label>
            <input value={form.followUp} onChange={(e) => setForm({ ...form, followUp: e.target.value })} className={inputCls} placeholder="Any follow-up actions needed..." />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} min-h-[70px] resize-none`} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTab;
