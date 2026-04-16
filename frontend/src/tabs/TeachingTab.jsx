import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import Modal from "../components/Modal.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

// ── Sub-section configs ───────────────────────────────────────────────────────
const SECTIONS = [
  {
    key: "sermonPrep",
    storeKey: "formationSermon",
    label: "Sermon Preparation",
    icon: "📜",
    fields: [
      { key: "scripture", label: "Scripture Text", type: "text" },
      { key: "theme", label: "Theme/Message", type: "text" },
      { key: "sources", label: "Sources Consulted", type: "text" },
      { key: "prepTime", label: "Preparation Time", type: "text", placeholder: "e.g. 2 hrs" },
      { key: "notes", label: "Notes or Insights", type: "textarea" }
    ],
    logLabel: (it) => it.scripture ? `${it.scripture}${it.theme ? " — " + it.theme : ""}` : it.theme || "—"
  },
  {
    key: "reading",
    storeKey: "formationReading",
    label: "Spiritual & Theological Reading",
    icon: "📚",
    fields: [
      { key: "title", label: "Title of Book", type: "text" },
      { key: "author", label: "Author", type: "text" },
      { key: "pages", label: "Pages or Chapters Read", type: "text" },
      { key: "insight", label: "Key Insight or Takeaway", type: "textarea" },
      { key: "application", label: "Application for Ministry", type: "textarea" },
      { key: "notes", label: "Notes or Insights", type: "textarea" }
    ],
    logLabel: (it) => it.title ? `${it.title}${it.author ? " · " + it.author : ""}` : "—"
  },
  {
    key: "videos",
    storeKey: "formationVideos",
    label: "Educational Videos / Lectures",
    icon: "🎬",
    fields: [
      { key: "topic", label: "Topic", type: "text" },
      { key: "speaker", label: "Speaker or Presenter", type: "text" },
      { key: "platform", label: "Platform or Source", type: "text", placeholder: "e.g. YouTube, Podcast..." },
      { key: "learning", label: "Key Learning Point", type: "textarea" },
      { key: "notes", label: "Notes or Insights", type: "textarea" }
    ],
    logLabel: (it) => it.topic ? `${it.topic}${it.speaker ? " · " + it.speaker : ""}` : "—"
  },
  {
    key: "retreats",
    storeKey: "formationRetreats",
    label: "Retreats & Spiritual Renewal",
    icon: "🙏",
    fields: [
      { key: "name", label: "Retreat Name", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "dates", label: "Dates", type: "text", placeholder: "e.g. Apr 15–17" },
      { key: "lesson", label: "Main Spiritual Lesson", type: "textarea" },
      { key: "notes", label: "Notes or Insights", type: "textarea" }
    ],
    logLabel: (it) => it.name ? `${it.name}${it.location ? " · " + it.location : ""}` : "—"
  },
  {
    key: "conferences",
    storeKey: "formationConferences",
    label: "Conferences & Continuing Education",
    icon: "🎓",
    fields: [
      { key: "name", label: "Conference Name", type: "text" },
      { key: "organizer", label: "Organizer", type: "text" },
      { key: "topic", label: "Topic or Theme", type: "text" },
      { key: "takeaway", label: "Key Takeaway", type: "textarea" },
      { key: "benefit", label: "How It May Benefit Parish Ministry", type: "textarea" },
      { key: "notes", label: "Notes or Insights", type: "textarea" }
    ],
    logLabel: (it) => it.name ? `${it.name}${it.topic ? " · " + it.topic : ""}` : "—"
  },
  {
    key: "research",
    storeKey: "formationResearch",
    label: "Research for Teaching & Writing",
    icon: "✍️",
    fields: [
      { key: "topics", label: "Research Topics", type: "text" },
      { key: "sources", label: "Sources Collected", type: "text" },
      { key: "curriculum", label: "Curriculum Development", type: "text" },
      { key: "articles", label: "Articles or Lessons Being Written", type: "text" },
      { key: "churchSchool", label: "Church School Lesson Development", type: "text" },
      { key: "catechetical", label: "Catechetical Material Preparation", type: "text" },
      { key: "notes", label: "Notes or Insights", type: "textarea" }
    ],
    logLabel: (it) => it.topics || it.curriculum || "—"
  }
];

const emptyForm = (sec) => {
  const f = {};
  sec.fields.forEach(fl => { f[fl.key] = ""; });
  return f;
};

// ── Single Sub-section ────────────────────────────────────────────────────────
const FormationSection = ({ sec, date }) => {
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
                  {sec.fields.filter(f => f.key !== "notes" && it[f.key]).slice(0, 3).map(f => (
                    <div key={f.key} className="text-xs text-texts mt-0.5">{it[f.key]}</div>
                  ))}
                  {it.notes && <div className="text-xs text-texts mt-0.5 italic">{it.notes}</div>}
                </div>
                <button onClick={() => remove(idx)} className="w-6 h-6 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setOpen(true)} className="px-4 py-2 bg-forest text-ivory rounded-xl text-sm shadow-soft hover:-translate-y-0.5 transition-transform">
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
          {sec.fields.map(fl => (
            <div key={fl.key}>
              <label className="text-sm font-medium text-texts block mb-1">{fl.label}</label>
              {fl.type === "textarea" ? (
                <textarea
                  value={form[fl.key]}
                  onChange={(e) => setForm({ ...form, [fl.key]: e.target.value })}
                  placeholder={fl.placeholder || ""}
                  className={`${inputCls} min-h-[75px] resize-none`}
                />
              ) : (
                <input
                  type="text"
                  value={form[fl.key]}
                  onChange={(e) => setForm({ ...form, [fl.key]: e.target.value })}
                  placeholder={fl.placeholder || ""}
                  className={inputCls}
                />
              )}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

// ── Main Tab ──────────────────────────────────────────────────────────────────
const TeachingTab = ({ date }) => {
  return (
    <div className="space-y-3">
      {SECTIONS.map(sec => (
        <FormationSection key={sec.key} sec={sec} date={date} />
      ))}
    </div>
  );
};

export default TeachingTab;
