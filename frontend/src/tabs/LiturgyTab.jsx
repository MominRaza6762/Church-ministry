import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import Modal from "../components/Modal.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

const WORSHIP_SERVICES = [
  "Vespers",
  "Compline (Great)",
  "Compline (Small)",
  "Midnight Office",
  "Matins (Orthros)",
  "The Hours",
  "Divine Liturgy of St. John Chrysostom",
  "Divine Liturgy of St. Basil the Great",
  "Liturgy of the Presanctified Gifts"
];

const emptyForm = () => ({ service: WORSHIP_SERVICES[0], time: "", notes: "" });

const LiturgyTab = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [items, setItems] = useState([]);
  const [worshipNotes, setWorshipNotes] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    setItems(Array.isArray(log?.liturgy?.entries) ? log.liturgy.entries : []);
    setWorshipNotes(log?.liturgy?.worshipNotes || "");
  }, [log?.liturgy]);

  const buildState = (entries, notes) => ({ entries, worshipNotes: notes });

  useAutoSave(date, "liturgy", buildState(items, worshipNotes));

  const add = () => {
    if (!form.service) return;
    const updated = [...items, { ...form }];
    setItems(updated);
    updateSectionLocal("liturgy", buildState(updated, worshipNotes));
    setOpen(false);
    setForm(emptyForm());
  };

  const remove = (idx) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    updateSectionLocal("liturgy", buildState(updated, worshipNotes));
  };

  const onNotesChange = (val) => {
    setWorshipNotes(val);
    updateSectionLocal("liturgy", buildState(items, val));
  };

  const inputCls = "border border-parchment-dark rounded-xl px-3 py-2 text-sm bg-parchment focus:bg-white focus:border-gold focus:outline-none transition-all w-full";

  return (
    <div className="space-y-3">
      <LogCard title="✝ Worship" subtitle={`${items.length} service${items.length !== 1 ? "s" : ""} logged`}>
        {items.length === 0 ? (
          <p className="text-texts text-sm py-1">No worship services logged today</p>
        ) : (
          <div className="space-y-2 mb-3">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-parchment border border-parchment-dark/50 rounded-xl px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-textp text-sm">{it.service}</div>
                  {it.time && <div className="text-xs text-texts mt-0.5">Time: {it.time}</div>}
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
          + Log Worship Service
        </button>
      </LogCard>

      <LogCard title="Worship Notes & Observations" subtitle="">
        <textarea
          value={worshipNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notes, reflections, or observations about today's worship..."
          className={`${inputCls} min-h-[120px] resize-none`}
        />
      </LogCard>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Worship Service"
        actions={
          <>
            <button onClick={() => setOpen(false)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark transition-colors">Cancel</button>
            <button onClick={add} className="px-4 py-2 bg-gold text-white rounded-xl text-sm shadow-soft hover:opacity-90 transition-opacity">Add</button>
          </>
        }>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Service</label>
            <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className={inputCls}>
              {WORSHIP_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Time</label>
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} min-h-[80px] resize-none`} placeholder="Any notes about this service..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LiturgyTab;
