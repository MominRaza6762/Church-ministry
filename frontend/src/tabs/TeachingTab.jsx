import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import Modal from "../components/Modal.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

const TeachingTab = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ topic: "", audience: "", time: "", duration: 0, scripture: "", notes: "" });

  useEffect(() => {
    setItems(Array.isArray(log?.teaching) ? log.teaching : []);
  }, [log?.teaching]);

  useAutoSave(date, "teaching", items);

  const add = () => {
    const updated = [...items, form];
    setItems(updated);
    updateSectionLocal("teaching", updated);
    setOpen(false);
    setForm({ topic: "", audience: "", time: "", duration: 0, scripture: "", notes: "" });
  };

  return (
    <div className="space-y-3">
      <LogCard title="🎤 Preaching, Teaching & Catechesis" subtitle={`${items.length} logged`}>
        {items.length === 0 ? (
          <div className="text-texts text-sm animate-float">No teaching sessions logged today</div>
        ) : (
          <div className="grid gap-2">
            {items.map((it, i) => (
              <div key={i} className="bg-parchment border rounded p-2">
                <div className="font-semibold">{it.topic}</div>
                <div className="text-sm text-texts">{it.audience} — {it.time} — {it.duration} min</div>
                <div className="text-sm text-texts">Scripture: {it.scripture}</div>
                <div className="text-sm">{it.notes}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
          <button onClick={() => setOpen(true)} className="px-3 py-2 bg-forest text-ivory rounded shadow-soft hover:-translate-y-0.5 transition-transform">+ Log Teaching / Sermon</button>
        </div>
      </LogCard>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Teaching / Sermon" actions={
        <>
          <button onClick={() => setOpen(false)} className="px-3 py-2 bg-parchment border rounded">Cancel</button>
          <button onClick={add} className="px-3 py-2 bg-gold text-white rounded shadow-soft">Add</button>
        </>
      }>
        <div className="grid gap-2">
          <label className="text-sm text-texts">Topic/Title</label>
          <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-gold" />
          <label className="text-sm text-texts mt-2">Audience/Group</label>
          <input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-gold" />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-sm text-texts">Time</label>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="border rounded px-2 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="text-sm text-texts">Duration (minutes)</label>
              <input type="number" min="0" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="border rounded px-2 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
          </div>
          <label className="text-sm text-texts mt-2">Scripture text</label>
          <input value={form.scripture} onChange={(e) => setForm({ ...form, scripture: e.target.value })} className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-gold" />
          <label className="text-sm text-texts mt-2">Materials/Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-gold min-h-[100px]" />
        </div>
      </Modal>
    </div>
  );
};

export default TeachingTab;