import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";
import { useGoogleCalendar } from "../hooks/useGoogleCalendar.js";
import { startGoogleOAuth, calendarStatusApi } from "../api/calendarApi.js";

const formatEventTime = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};

const SmallSpinner = () => (
  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

const AdditionalSections = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [comms, setComms] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [reflections, setReflections] = useState({ observations: "", gratitude: "", intentions: "", signed: false });

  const { events, refresh, loading: calLoading } = useGoogleCalendar();
  const [calConnected, setCalConnected] = useState(false);
  const [checkingCal, setCheckingCal] = useState(true);
  const [connectingCal, setConnectingCal] = useState(false);

  useEffect(() => {
    calendarStatusApi()
      .then(d => setCalConnected(d.connected || false))
      .catch(() => setCalConnected(false))
      .finally(() => setCheckingCal(false));
  }, []);

  useEffect(() => {
    setComms(Array.isArray(log?.communications) ? log.communications : []);
    setFinancials(Array.isArray(log?.financials) ? log.financials : []);
    setReflections(log?.reflections || { observations: "", gratitude: "", intentions: "", signed: false });
  }, [log?.communications, log?.financials, log?.reflections]);

  useAutoSave(date, "communications", comms);
  useAutoSave(date, "financials", financials);
  useAutoSave(date, "reflections", reflections);

  const addComm = () => { const u = [...comms, { time: "", contact: "", subject: "", direction: "In", action: "" }]; setComms(u); updateSectionLocal("communications", u); };
  const updateComm = (i, k, v) => { const a = comms.map((c, idx) => idx === i ? { ...c, [k]: v } : c); setComms(a); updateSectionLocal("communications", a); };
  const removeComm = (i) => { const a = comms.filter((_, idx) => idx !== i); setComms(a); updateSectionLocal("communications", a); };
  const addFinancial = () => { const u = [...financials, { time: "", donor: "", purpose: "", amount: 0, notes: "" }]; setFinancials(u); updateSectionLocal("financials", u); };
  const updateFinancial = (i, k, v) => { const a = financials.map((f, idx) => idx === i ? { ...f, [k]: k === "amount" ? Number(v || 0) : v } : f); setFinancials(a); updateSectionLocal("financials", a); };
  const removeFinancial = (i) => { const a = financials.filter((_, idx) => idx !== i); setFinancials(a); updateSectionLocal("financials", a); };

  const calHeader = (
    <div className="flex items-center gap-2">
      {checkingCal ? (
        <span className="text-xs text-texts flex items-center gap-1"><SmallSpinner />Checking...</span>
      ) : calConnected ? (
        <>
          <span className="flex items-center gap-1 text-xs text-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />Synced
          </span>
          <button onClick={refresh} disabled={calLoading}
            className="px-2.5 py-1 bg-parchment border border-parchment-dark rounded-lg text-xs hover:bg-parchment-dark transition-colors disabled:opacity-50 flex items-center gap-1">
            {calLoading ? <><SmallSpinner />Loading...</> : "Refresh"}
          </button>
        </>
      ) : (
        <button disabled={connectingCal}
          onClick={async () => { setConnectingCal(true); try { await startGoogleOAuth(); } catch (e) { alert(e?.message || "Failed"); setConnectingCal(false); } }}
          className="px-2.5 py-1 bg-burgundy text-ivory rounded-lg text-xs hover:bg-burgundy-dark transition-colors disabled:opacity-60 flex items-center gap-1">
          {connectingCal ? <><SmallSpinner />Connecting...</> : "Connect Google"}
        </button>
      )}
    </div>
  );

  const inputCls = "border border-parchment-dark rounded-lg px-2 py-1.5 text-xs bg-parchment focus:border-gold focus:bg-white transition-all";

  return (
    <div className="space-y-3">

      {/* Daily Schedule — events only, no hourly grid */}
      <LogCard title="Daily Schedule" subtitle="Today's Google Calendar events" right={calHeader}>
        {calLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-texts text-sm">
            <SmallSpinner />Loading calendar events...
          </div>
        ) : !calConnected ? (
          <div className="py-8 text-center">
            <div className="text-4xl mb-3 animate-float">📅</div>
            <p className="text-texts text-sm">Connect Google Calendar to see today's events here.</p>
            <button
              onClick={async () => { setConnectingCal(true); try { await startGoogleOAuth(); } catch (e) { alert(e?.message || "Failed"); setConnectingCal(false); } }}
              disabled={connectingCal}
              className="mt-3 px-4 py-2 bg-burgundy text-ivory text-xs font-medium rounded-xl hover:bg-burgundy-dark transition-colors disabled:opacity-60"
            >
              {connectingCal ? "Connecting..." : "Connect Google Calendar"}
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-4xl mb-3 animate-float">✦</div>
            <p className="text-texts text-sm italic">No events scheduled for today.</p>
            <p className="text-texts/60 text-xs mt-1">Add events in Google Calendar and click Refresh.</p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            <div className="text-[10px] font-semibold text-texts uppercase tracking-widest">
              Today's Events ({events.length})
            </div>
            {events.map((ev, idx) => {
              const startTime = formatEventTime(ev.start);
              const endTime = formatEventTime(ev.end);
              return (
                <div key={ev.id || idx}
                  className="flex items-start gap-3 bg-parchment/60 border border-parchment-dark/40 rounded-xl px-4 py-3 hover:border-gold/40 transition-colors group">
                  <div className="flex-shrink-0 w-16">
                    <div className="text-xs font-mono font-bold text-burgundy">{startTime}</div>
                    {endTime && endTime !== startTime && (
                      <div className="text-[10px] font-mono text-texts/60 mt-0.5">— {endTime}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-textp leading-snug">{ev.summary}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-burgundy/30 mt-1.5 flex-shrink-0 group-hover:bg-burgundy/60 transition-colors" />
                </div>
              );
            })}
          </div>
        )}
      </LogCard>

      {/* Telephone & Correspondence Log */}
      <LogCard title="Telephone & Correspondence Log" subtitle="">
        <div className="space-y-2">
          {comms.length === 0 && <p className="text-texts text-sm py-1">No communications logged today</p>}
          {comms.map((c, i) => (
            <div key={i} className="grid grid-cols-5 gap-1.5 items-center">
              <input placeholder="Time" value={c.time} onChange={(e) => updateComm(i, "time", e.target.value)} className={inputCls} />
              <input placeholder="Contact" value={c.contact} onChange={(e) => updateComm(i, "contact", e.target.value)} className={inputCls} />
              <input placeholder="Subject" value={c.subject} onChange={(e) => updateComm(i, "subject", e.target.value)} className={inputCls} />
              <select value={c.direction} onChange={(e) => updateComm(i, "direction", e.target.value)} className={inputCls}>
                <option>In</option><option>Out</option>
              </select>
              <div className="flex gap-1">
                <input placeholder="Action" value={c.action} onChange={(e) => updateComm(i, "action", e.target.value)} className={`flex-1 min-w-0 ${inputCls}`} />
                <button onClick={() => removeComm(i)} className="w-6 h-7 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          ))}
          <button onClick={addComm} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark transition-colors">+ Log Communication</button>
        </div>
      </LogCard>

      {/* Financial Notes */}
      <LogCard title="Financial Notes & Charitable Receipts" subtitle="">
        <div className="space-y-2">
          {financials.length === 0 && <p className="text-texts text-sm py-1">No financial entries logged today</p>}
          {financials.map((f, i) => (
            <div key={i} className="grid grid-cols-5 gap-1.5 items-center">
              <input placeholder="Time" value={f.time} onChange={(e) => updateFinancial(i, "time", e.target.value)} className={inputCls} />
              <input placeholder="Donor/Source" value={f.donor} onChange={(e) => updateFinancial(i, "donor", e.target.value)} className={inputCls} />
              <input placeholder="Purpose" value={f.purpose} onChange={(e) => updateFinancial(i, "purpose", e.target.value)} className={inputCls} />
              <input placeholder="Amount" type="number" value={f.amount} onChange={(e) => updateFinancial(i, "amount", e.target.value)} className={inputCls} />
              <div className="flex gap-1">
                <input placeholder="Notes" value={f.notes} onChange={(e) => updateFinancial(i, "notes", e.target.value)} className={`flex-1 min-w-0 ${inputCls}`} />
                <button onClick={() => removeFinancial(i)} className="w-6 h-7 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          ))}
          <button onClick={addFinancial} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark transition-colors">+ Log Financial Entry</button>
        </div>
      </LogCard>

      {/* Pastoral Notes & Reflections */}
      <LogCard title="Pastoral Notes, Reflections & Thanksgiving" subtitle="">
        <div className="space-y-3">
          {[
            { key: "observations", label: "Significant observations / Pastoral concerns", placeholder: "Note any pastoral concerns..." },
            { key: "gratitude", label: "Gratitude & Spiritual fruits noticed today", placeholder: "What are you grateful for today?" },
            { key: "intentions", label: "Intentions for tomorrow / Follow-up actions", placeholder: "What needs follow-up tomorrow?" }
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <div className="text-xs font-semibold text-texts uppercase tracking-wider mb-1.5">{label}</div>
              <textarea value={reflections[key]}
                onChange={(e) => setReflections(r => ({ ...r, [key]: e.target.value }))}
                className="w-full border border-parchment-dark rounded-xl px-3 py-2 text-sm bg-parchment focus:bg-white focus:border-gold transition-all min-h-[80px] resize-none"
                placeholder={placeholder} />
            </div>
          ))}
          <div className="bg-parchment rounded-xl px-4 py-3 border border-parchment-dark/40">
            <div className="text-xs font-semibold text-texts uppercase tracking-wider mb-1">Evening Prayer of Examination</div>
            <p className="text-textp text-sm font-serif italic leading-relaxed">
              O Lord, grant me to see my own sins and not to judge my brother. For blessed art Thou unto the ages of ages. Amen.
            </p>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div onClick={() => setReflections(r => ({ ...r, signed: !r.signed }))}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0
                ${reflections.signed ? "bg-burgundy border-burgundy" : "bg-ivory border-parchment-dark"}`}>
              {reflections.signed && (
                <svg className="w-3 h-3 text-ivory" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm text-textp">Evening examination complete ✓</span>
          </label>
        </div>
      </LogCard>

    </div>
  );
};

export default AdditionalSections;