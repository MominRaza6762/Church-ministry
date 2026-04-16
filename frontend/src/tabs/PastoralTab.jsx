import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import Modal from "../components/Modal.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

// ── Sub-section configs ─────────────────────────────────────────────────────
const SECTIONS = [
  {
    key: "spiritualDirection",
    label: "Spiritual Direction & Counseling",
    icon: "🕊️",
    storeKey: "pastoralVisits",  // keep original key for backward compat
    formFields: ["person", "time", "purpose", "notes"],
    fieldLabels: { person: "Person/Family Name", time: "Time", purpose: "Purpose/Need", notes: "Notes" },
    logLabel: (it) => `${it.person || "—"} · ${it.time || ""}`
  },
  {
    key: "visitation",
    label: "Visitation",
    icon: "🏥",
    storeKey: "visitation",
    subtypes: ["Hospital/Hospice", "Homebound/Shut-ins", "Bereavement Follow-up", "Prison", "Other"],
    formFields: ["subtype", "name", "place", "time", "purpose", "notes"],
    fieldLabels: { subtype: "Visit Type", name: "Name/Place", place: "Location", time: "Time", purpose: "Purpose/Needs", notes: "Notes" },
    logLabel: (it) => `${it.subtype || ""} · ${it.name || "—"}`
  },
  {
    key: "education",
    label: "Education & Mentorship",
    icon: "📖",
    storeKey: "pastoralEducation",
    subtypes: ["Bible Study / Adult Ed", "Youth Group Meetings", "Church School Ministry", "College Ministry", "Other"],
    formFields: ["subtype", "place", "time", "purpose", "notes"],
    fieldLabels: { subtype: "Activity Type", place: "Place", time: "Time", purpose: "Purpose/Needs", notes: "Notes" },
    logLabel: (it) => `${it.subtype || ""} · ${it.place || "—"}`
  },
  {
    key: "meetings",
    label: "Meetings",
    icon: "🤝",
    storeKey: "pastoralMeetings",
    subtypes: ["Parish Council / Church Board Meeting", "Committees Meeting", "Local Clergy Brotherhood", "Newcomers/Inquirers", "Other"],
    formFields: ["subtype", "place", "time", "purpose", "notes"],
    fieldLabels: { subtype: "Meeting Type", place: "Place", time: "Time", purpose: "Purpose/Needs", notes: "Notes" },
    logLabel: (it) => `${it.subtype || ""} · ${it.place || "—"}`
  },
  {
    key: "parishEvents",
    label: "Parish Events",
    icon: "🎉",
    storeKey: "pastoralEvents",
    subtypes: ["Fellowships", "Fundraisers", "Picnics", "Outings", "Other"],
    formFields: ["subtype", "place", "time", "purpose", "notes"],
    fieldLabels: { subtype: "Event Type", place: "Place", time: "Time", purpose: "Purpose/Needs", notes: "Notes" },
    logLabel: (it) => `${it.subtype || ""} · ${it.place || "—"}`
  }
];

const emptyForm = (sec) => {
  const f = {};
  sec.formFields.forEach(k => { f[k] = ""; });
  if (sec.subtypes) f.subtype = sec.subtypes[0];
  return f;
};

// ── Single Sub-section Component ─────────────────────────────────────────────
const PastoralSection = ({ sec, date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm(sec));

  useEffect(() => {
    setItems(Array.isArray(log?.[sec.storeKey]) ? log[sec.storeKey] : []);
  }, [log?.[sec.storeKey]]);

  useAutoSave(date, sec.storeKey, items);

  const add = () => {
    const updated = [...items, { ...form }];
    setItems(updated);
    updateSectionLocal(sec.storeKey, updated);
    setOpen(false);
    setForm(emptyForm(sec));
  };

  const remove = (idx) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    updateSectionLocal(sec.storeKey, updated);
  };

  const inputCls = "border border-parchment-dark rounded-xl px-3 py-2 text-sm bg-parchment focus:bg-white focus:border-gold focus:outline-none transition-all w-full";

  return (
    <>
      <LogCard title={`${sec.icon} ${sec.label}`} subtitle={`${items.length} logged`}>
        {items.length === 0 ? (
          <p className="text-texts text-sm py-1">No entries logged today</p>
        ) : (
          <div className="space-y-2 mb-3">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-parchment border border-parchment-dark/50 rounded-xl px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-textp text-sm">{sec.logLabel(it)}</div>
                  {it.time && <div className="text-xs text-texts mt-0.5">🕐 {it.time}</div>}
                  {it.purpose && <div className="text-xs text-texts mt-0.5">{it.purpose}</div>}
                  {it.notes && <div className="text-xs text-texts mt-0.5 italic">{it.notes}</div>}
                </div>
                <button onClick={() => remove(idx)} className="w-6 h-6 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setOpen(true)} className="px-4 py-2 bg-navy text-ivory rounded-xl text-sm shadow-soft hover:-translate-y-0.5 transition-transform">
          + Log {sec.label}
        </button>
      </LogCard>

      <Modal open={open} onClose={() => setOpen(false)} title={`Log ${sec.label}`}
        actions={
          <>
            <button onClick={() => setOpen(false)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark transition-colors">Cancel</button>
            <button onClick={add} className="px-4 py-2 bg-gold text-white rounded-xl text-sm shadow-soft hover:opacity-90 transition-opacity">Add</button>
          </>
        }>
        <div className="space-y-3">
          {sec.formFields.map(field => (
            <div key={field}>
              <label className="text-sm font-medium text-texts block mb-1">{sec.fieldLabels[field] || field}</label>
              {field === "subtype" && sec.subtypes ? (
                <select value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className={inputCls}>
                  {sec.subtypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : field === "notes" || field === "purpose" ? (
                <textarea value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className={`${inputCls} min-h-[80px] resize-none`} />
              ) : field === "time" ? (
                <input type="time" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className={inputCls} />
              ) : (
                <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className={inputCls} />
              )}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

// ── Main Tab ─────────────────────────────────────────────────────────────────
const PastoralTab = ({ date }) => {
  return (
    <div className="space-y-3">
      {SECTIONS.map(sec => (
        <PastoralSection key={sec.key} sec={sec} date={date} />
      ))}
    </div>
  );
};

export default PastoralTab;
