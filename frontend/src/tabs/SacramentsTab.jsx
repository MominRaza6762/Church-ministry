import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import Modal from "../components/Modal.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

const types = [
  "Holy Confession","Holy Communion (outside Liturgy)","Holy Unction","Baptism","Chrismation","Marriage (Crowning)","Funeral (Panikhida)","Blessing of a Home/Space","Other"
];

const SacramentsTab = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: types[0], recipient: "", count: 1, notes: "", time: "" });

  useEffect(() => {
    setItems(Array.isArray(log?.sacraments) ? log.sacraments : []);
  }, [log?.sacraments]);

  useAutoSave(date, "sacraments", items);

  const add = () => {
    const updated = [...items, form];
    setItems(updated);
    updateSectionLocal("sacraments", updated);
    setOpen(false);
    setForm({ type: types[0], recipient: "", count: 1, notes: "", time: "" });
  };

  return (
    <div className="space-y-3">
      <LogCard title="✠ Sacramental Ministry" subtitle={`${items.length} logged`}>
        {items.length === 0 ? (
          <div className="text-texts text-sm animate-float">No sacramental ministry logged today</div>
        ) : (
          <div className="grid gap-2">
            {items.map((it, idx) => (
              <div key={idx} className="bg-parchment border rounded p-2">
                <div className="font-semibold">{it.type}</div>
                <div className="text-sm text-texts">{it.recipient} — Count: {it.count} — {it.time}</div>
                <div className="text-sm">{it.notes}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
          <button onClick={() => setOpen(true)} className="px-3 py-2 bg-burgundy text-ivory rounded shadow-soft hover:-translate-y-0.5 transition-transform">+ Log Sacramental Ministry</button>
        </div>
      </LogCard>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Sacramental Ministry" actions={
        <>
          <button onClick={() => setOpen(false)} className="px-3 py-2 bg-parchment border rounded">Cancel</button>
          <button onClick={add} className="px-3 py-2 bg-gold text-white rounded shadow-soft">Add</button>
        </>
      }>
        <div className="grid gap-2">
          <label className="text-sm text-texts">Sacrament Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-gold">
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="text-sm text-texts mt-2">Recipient Name(s)</label>
          <input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-gold" />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-sm text-texts">Count</label>
              <input type="number" min="1" value={form.count} onChange={(e) => setForm({ ...form, count: Number(e.target.value) })} className="border rounded px-2 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="text-sm text-texts">Date/Time</label>
              <input type="datetime-local" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="border rounded px-2 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
          </div>
          <label className="text-sm text-texts mt-2">Notes/Follow-up</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-gold min-h-[100px]" />
        </div>
      </Modal>
    </div>
  );
};

export default SacramentsTab;