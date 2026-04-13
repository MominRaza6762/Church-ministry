import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import Modal from "../components/Modal.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

const PastoralTab = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ person: "", time: "", purpose: "", type: "In-person", followUp: false, notes: "" });

  useEffect(() => {
    setItems(Array.isArray(log?.pastoralVisits) ? log.pastoralVisits : []);
  }, [log?.pastoralVisits]);

  useAutoSave(date, "pastoralVisits", items);

  const add = () => {
    const updated = [...items, form];
    setItems(updated);
    updateSectionLocal("pastoralVisits", updated);
    setOpen(false);
    setForm({ person: "", time: "", purpose: "", type: "In-person", followUp: false, notes: "" });
  };

  return (
    <div className="space-y-3">
      <LogCard title="👤 Pastoral Visits & Encounters" subtitle={`${items.length} logged`}>
        {items.length === 0 ? (
          <div className="text-texts text-sm animate-float">No pastoral visits recorded today</div>
        ) : (
          <div className="grid gap-2">
            {items.map((it, idx) => (
              <div key={idx} className="bg-parchment border rounded p-2">
                <div className="font-semibold">{it.person} — {it.type}</div>
                <div className="text-sm text-texts">{it.time} — {it.purpose}</div>
                <div className="text-sm">{it.notes}</div>
                {it.followUp ? <div className="text-danger text-sm">Follow-up required</div> : null}
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
          <button onClick={() => setOpen(true)} className="px-3 py-2 bg-navy text-ivory rounded shadow-soft hover:-translate-y-0.5 transition-transform">+ Log Pastoral Encounter</button>
        </div>
      </LogCard>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Pastoral Encounter" actions={
        <>
          <button onClick={() => setOpen(false)} className="px-3 py-2 bg-parchment border rounded">Cancel</button>
          <button onClick={add} className="px-3 py-2 bg-gold text-white rounded shadow-soft">Add</button>
        </>
      }>
        <div className="grid gap-2">
          <label className="text-sm text-texts">Person/Family Name</label>
          <input value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-gold" />
          <label className="text-sm text-texts mt-2">Time of visit</label>
          <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-gold" />
          <label className="text-sm text-texts mt-2">Purpose/Need</label>
          <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-gold" />
          <div className="mt-2">
            <div className="text-sm text-texts">Visit Type</div>
            <div className="flex gap-3 mt-1">
              {["In-person","Phone","Hospital","Home visit"].map(t => (
                <label key={t} className="flex items-center gap-1 text-sm">
                  <input type="radio" name="ptype" checked={form.type === t} onChange={() => setForm({ ...form, type: t })} />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.followUp} onChange={(e) => setForm({ ...form, followUp: e.target.checked })} />
            Follow-up Required
          </label>
          <label className="text-sm text-texts mt-2">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-gold min-h-[100px]" />
        </div>
      </Modal>
    </div>
  );
};

export default PastoralTab;