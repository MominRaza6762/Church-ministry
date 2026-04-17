import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import Modal from "../components/Modal.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";

const morningItems = [
  "Rising prayers",
  "Psalter reading (Kathisma)",
  "Daily Scripture",
  "Jesus Prayer",
  "Akathist/Canon",
  "Prostrations",
  "Fasting observed",
  "Typika"
];

const eveningItems = [
  "Evening prayers read",
  "Examination of conscience",
  "Akathist/Canon read",
  "Compline prayed",
  "Fasting observed",
  "Prostrations/Metanias",
  "Daily Scripture"
];

const buildDefault = () => {
  const out = {};
  morningItems.forEach(it => out[`M:${it}`] = false);
  eveningItems.forEach(it => out[`E:${it}`] = false);
  out["Chapters"] = "";
  out["FastingLevel"] = "";
  return out;
};

// ── Prayer Requests ───────────────────────────────────────────────────────────
const emptyHealth = () => ({ name: "", cause: "", notes: "" });
const emptyDeparted = () => ({ name: "", cause: "", notes: "" });

const PrayerRequestsSection = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);

  const [healthList, setHealthList] = useState([]);
  const [departedList, setDepartedList] = useState([]);
  const [healthOpen, setHealthOpen] = useState(false);
  const [departedOpen, setDepartedOpen] = useState(false);
  const [healthForm, setHealthForm] = useState(emptyHealth());
  const [departedForm, setDepartedForm] = useState(emptyDeparted());

  useEffect(() => {
    setHealthList(Array.isArray(log?.prayerRequestsHealth) ? log.prayerRequestsHealth : []);
    setDepartedList(Array.isArray(log?.prayerRequestsDeparted) ? log.prayerRequestsDeparted : []);
  }, [log?.prayerRequestsHealth, log?.prayerRequestsDeparted]);

  useAutoSave(date, "prayerRequestsHealth", healthList);
  useAutoSave(date, "prayerRequestsDeparted", departedList);

  const addHealth = () => {
    const updated = [...healthList, { ...healthForm }];
    setHealthList(updated);
    updateSectionLocal("prayerRequestsHealth", updated);
    setHealthOpen(false);
    setHealthForm(emptyHealth());
  };

  const removeHealth = (idx) => {
    const updated = healthList.filter((_, i) => i !== idx);
    setHealthList(updated);
    updateSectionLocal("prayerRequestsHealth", updated);
  };

  const addDeparted = () => {
    const updated = [...departedList, { ...departedForm }];
    setDepartedList(updated);
    updateSectionLocal("prayerRequestsDeparted", updated);
    setDepartedOpen(false);
    setDepartedForm(emptyDeparted());
  };

  const removeDeparted = (idx) => {
    const updated = departedList.filter((_, i) => i !== idx);
    setDepartedList(updated);
    updateSectionLocal("prayerRequestsDeparted", updated);
  };

  const inputCls = "border border-parchment-dark rounded-xl px-3 py-2 text-sm bg-parchment focus:bg-white focus:border-gold focus:outline-none transition-all w-full";

  const EntryCard = ({ item, onRemove }) => (
    <div className="flex items-start gap-3 bg-parchment border border-parchment-dark/50 rounded-xl px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-textp text-sm">{item.name || "—"}</div>
        {item.cause && <div className="text-xs text-texts mt-0.5">{item.cause}</div>}
        {item.notes && <div className="text-xs text-texts mt-0.5 italic">{item.notes}</div>}
      </div>
      <button onClick={onRemove} className="w-6 h-6 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg flex-shrink-0 mt-0.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  return (
    <>
      <LogCard title="🙏 Prayer Requests" subtitle={`${healthList.length + departedList.length} total`}>
        {/* For Health */}
        <div className="mb-3">
          <div className="text-xs font-semibold text-texts uppercase tracking-wider mb-2">
            For Health ({healthList.length})
          </div>
          {healthList.length === 0 ? (
            <p className="text-texts text-sm py-0.5 mb-2">No entries</p>
          ) : (
            <div className="space-y-2 mb-2">
              {healthList.map((it, idx) => (
                <EntryCard key={idx} item={it} onRemove={() => removeHealth(idx)} />
              ))}
            </div>
          )}
          <button onClick={() => setHealthOpen(true)}
            className="px-3 py-1.5 bg-parchment border border-parchment-dark rounded-xl text-xs hover:bg-parchment-dark transition-colors">
            + Add For Health
          </button>
        </div>

        <div className="border-t border-parchment-dark/30 pt-3">
          {/* For Departed */}
          <div className="text-xs font-semibold text-texts uppercase tracking-wider mb-2">
            For Departed ({departedList.length})
          </div>
          {departedList.length === 0 ? (
            <p className="text-texts text-sm py-0.5 mb-2">No entries</p>
          ) : (
            <div className="space-y-2 mb-2">
              {departedList.map((it, idx) => (
                <EntryCard key={idx} item={it} onRemove={() => removeDeparted(idx)} />
              ))}
            </div>
          )}
          <button onClick={() => setDepartedOpen(true)}
            className="px-3 py-1.5 bg-parchment border border-parchment-dark rounded-xl text-xs hover:bg-parchment-dark transition-colors">
            + Add For Departed
          </button>
        </div>
      </LogCard>

      {/* For Health Modal */}
      <Modal open={healthOpen} onClose={() => setHealthOpen(false)} title="Prayer Request — For Health"
        actions={
          <>
            <button onClick={() => setHealthOpen(false)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark transition-colors">Cancel</button>
            <button onClick={addHealth} className="px-4 py-2 bg-gold text-white rounded-xl text-sm hover:opacity-90 transition-opacity">Add</button>
          </>
        }>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Name</label>
            <input value={healthForm.name} onChange={(e) => setHealthForm({ ...healthForm, name: e.target.value })} className={inputCls} placeholder="Person's name" />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Cause of Illness</label>
            <input value={healthForm.cause} onChange={(e) => setHealthForm({ ...healthForm, cause: e.target.value })} className={inputCls} placeholder="e.g. Cancer, Surgery, Recovery..." />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Notes</label>
            <textarea value={healthForm.notes} onChange={(e) => setHealthForm({ ...healthForm, notes: e.target.value })} className={`${inputCls} min-h-[80px] resize-none`} placeholder="Additional notes..." />
          </div>
        </div>
      </Modal>

      {/* For Departed Modal */}
      <Modal open={departedOpen} onClose={() => setDepartedOpen(false)} title="Prayer Request — For Departed"
        actions={
          <>
            <button onClick={() => setDepartedOpen(false)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark transition-colors">Cancel</button>
            <button onClick={addDeparted} className="px-4 py-2 bg-gold text-white rounded-xl text-sm hover:opacity-90 transition-opacity">Add</button>
          </>
        }>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Name</label>
            <input value={departedForm.name} onChange={(e) => setDepartedForm({ ...departedForm, name: e.target.value })} className={inputCls} placeholder="Person's name" />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Cause of Death</label>
            <input value={departedForm.cause} onChange={(e) => setDepartedForm({ ...departedForm, cause: e.target.value })} className={inputCls} placeholder="e.g. Heart failure, Cancer..." />
          </div>
          <div>
            <label className="text-sm font-medium text-texts block mb-1">Notes</label>
            <textarea value={departedForm.notes} onChange={(e) => setDepartedForm({ ...departedForm, notes: e.target.value })} className={`${inputCls} min-h-[80px] resize-none`} placeholder="Additional notes..." />
          </div>
        </div>
      </Modal>
    </>
  );
};

// ── Main PrayerTab ────────────────────────────────────────────────────────────
const PrayerTab = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [state, setState] = useState(buildDefault());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const pr = log?.prayer || {};
    const merged = buildDefault();
    Object.keys(pr).forEach(k => { merged[k] = pr[k]; });
    setState(merged);
    setNotes(log?.prayerNotes || "");
  }, [log?.prayer, log?.prayerNotes]);

  useAutoSave(date, "prayer", state);
  useAutoSave(date, "prayerNotes", notes);

  const toggle = (k) => {
    const updated = { ...state, [k]: !state[k] };
    setState(updated);
    updateSectionLocal("prayer", updated);
  };

  const onField = (k, val) => {
    const updated = { ...state, [k]: val };
    setState(updated);
    updateSectionLocal("prayer", updated);
  };

  const morningDone = morningItems.filter(it => state[`M:${it}`]).length;
  const eveningDone = eveningItems.filter(it => state[`E:${it}`]).length;

  const inputCls = "border border-parchment-dark rounded-xl px-3 py-2 text-sm bg-parchment focus:bg-white focus:border-gold focus:outline-none transition-all";

  const CheckItem = ({ label, checked, onToggle }) => (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
      <div onClick={onToggle}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
          ${checked ? "bg-burgundy border-burgundy" : "bg-ivory border-parchment-dark"}`}>
        {checked && (
          <svg className="w-3 h-3 text-ivory" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-sm ${checked ? "line-through text-texts" : "text-textp"}`}>{label}</span>
    </label>
  );

  return (
    <div className="space-y-3">
      <LogCard title="♱ Personal Rule of Life" subtitle="Morning and Evening Rule checklist">
        <div className="mt-2">
          <div className="font-serif text-burgundy mb-2">Morning Rule ({morningDone}/{morningItems.length})</div>
          <div className="space-y-1">
            {morningItems.map(it => (
              <CheckItem key={it} label={it} checked={state[`M:${it}`]} onToggle={() => toggle(`M:${it}`)} />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="font-serif text-burgundy mb-2">Evening Rule ({eveningDone}/{eveningItems.length})</div>
          <div className="space-y-1">
            {eveningItems.map(it => (
              <CheckItem key={it} label={it} checked={state[`E:${it}`]} onToggle={() => toggle(`E:${it}`)} />
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-texts whitespace-nowrap">Chapters of Scripture read</span>
            <input type="text" value={state["Chapters"] || ""} onChange={(e) => onField("Chapters", e.target.value)} className={`${inputCls} flex-1`} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-texts whitespace-nowrap">Fasting level today</span>
            <input type="text" value={state["FastingLevel"] || ""} onChange={(e) => onField("FastingLevel", e.target.value)} className={`${inputCls} flex-1`} />
          </div>
          <div>
            <div className="text-sm font-medium text-texts mb-1">Prayer Notes</div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              className={`${inputCls} w-full min-h-[100px] resize-none`}
              placeholder="Notes, intentions, thoughts during prayer..." />
          </div>
        </div>
      </LogCard>

      {/* Prayer Requests — after Evening prayers section */}
      <PrayerRequestsSection date={date} />
    </div>
  );
};

export default PrayerTab;
