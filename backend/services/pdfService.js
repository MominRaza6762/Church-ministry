import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import puppeteer from "puppeteer";

const style = `
  <style>
    @page { margin: 20mm; }
    body { font-family: Georgia, 'Times New Roman', serif; background: #fff; color: #1A1A1A; }
    h1, h2, h3 { color: #5C1A27; }
    .gold { color: #B8952A; }
    .section { padding: 12px 0; border-top: 1px solid #ddd; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
    .mono { font-family: 'Courier New', monospace; }
    .card { background: #FAF7F1; padding: 8px; border-radius: 6px; }
    .row { display: flex; justify-content: space-between; }
    .muted { color: #6B6B6B; }
    .divider { text-align: center; margin: 6px 0; color: #B8952A; }
    .title { letter-spacing: 0.1em; text-transform: uppercase; }
    .small { font-size: 12px; }
  </style>
`;

const escape = (val) => {
  if (val === null || val === undefined) return "";
  const s = String(val);
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "&") out.push("&amp;");
    else if (ch === "<") out.push("&lt;");
    else if (ch === ">") out.push("&gt;");
    else if (ch === '"') out.push("&quot;");
    else if (ch === "'") out.push("&#039;");
    else out.push(ch);
  }
  return out.join("");
};

export const renderDailyLogHTML = (user, date, log) => {
  const parish = escape(user?.parishName || "");
  const name = escape(user?.name || "");
  const d = escape(date || "");
  const liturgy = log?.liturgy || {};
  const prayer = log?.prayer || {};
  const sacraments = Array.isArray(log?.sacraments) ? log.sacraments : [];
  const visits = Array.isArray(log?.pastoralVisits) ? log.pastoralVisits : [];
  const admin = log?.admin || {};
  const teaching = Array.isArray(log?.teaching) ? log.teaching : [];
  const schedule = Array.isArray(log?.dailySchedule) ? log.dailySchedule : [];
  const comms = Array.isArray(log?.communications) ? log.communications : [];
  const fins = Array.isArray(log?.financials) ? log.financials : [];
  const refs = log?.reflections || {};
  const prNotes = escape(log?.prayerNotes || "");

  const listObj = (obj) => {
    const entries = Object.keys(obj || {});
    if (entries.length === 0) return "<div class='muted small'>No entries</div>";
    const lines = [];
    for (let i = 0; i < entries.length; i++) {
      const k = entries[i];
      const v = obj[k];
      const status = typeof v === "object" ? (v.completed ? "✓" : (v.served ? "•" : "")) : (v ? "✓" : "");
      lines.push(`<div class="row"><div>${escape(k)}</div><div>${escape(status)}</div></div>`);
    }
    return lines.join("");
  };

  const listArray = (arr, map) => {
    if (!arr || arr.length === 0) return "<div class='muted small'>No entries</div>";
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      out.push(`<div class="card small">${map(arr[i], i)}</div>`);
    }
    return out.join("");
  };

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        ${style}
      </head>
      <body>
        <h1 class="title" style="text-align:center;color:#B8952A;">✝ DAILY OFFICE JOURNAL ✝</h1>
        <div class="divider">✦ ✦ ✦</div>
        <div class="row"><div><b>Priest:</b> ${name}</div><div><b>Parish:</b> ${parish}</div></div>
        <div class="gold" style="text-align:center;font-style:italic;margin-top:4px;">${d}</div>

        <div class="section">
          <h2>✝ Liturgical Offices</h2>
          <div class="card">${listObj(liturgy)}</div>
        </div>

        <div class="section">
          <h2>♱ Personal Rule of Life</h2>
          <div class="card">${listObj(prayer)}</div>
          <div class="small muted" style="margin-top:6px;"><b>Prayer Notes:</b> ${prNotes}</div>
        </div>

        <div class="section">
          <h2>✠ Sacramental Ministry</h2>
          ${listArray(sacraments, (s) => {
            const t = escape(s?.type || "");
            const r = escape(s?.recipient || "");
            const c = escape(s?.count || "");
            const n = escape(s?.notes || "");
            const tm = escape(s?.time || "");
            return `<div><b>${t}</b> — ${r} (x${c}) <span class="muted">at ${tm}</span><div class="small">${n}</div></div>`;
          })}
        </div>

        <div class="section">
          <h2>👤 Pastoral Visits & Encounters</h2>
          ${listArray(visits, (v) => {
            const p = escape(v?.person || "");
            const t = escape(v?.type || "");
            const n = escape(v?.notes || "");
            const tm = escape(v?.time || "");
            const f = v?.followUp ? "Follow-up required" : "";
            return `<div><b>${p}</b> — ${t} <span class="muted">at ${tm}</span><div class="small">${n} ${f}</div></div>`;
          })}
        </div>

        <div class="section">
          <h2>📋 Administrative & Parish Duties</h2>
          <div class="card">${listObj(admin)}</div>
        </div>

        <div class="section">
          <h2>🎤 Preaching, Teaching & Catechesis</h2>
          ${listArray(teaching, (t) => {
            const topic = escape(t?.topic || "");
            const aud = escape(t?.audience || "");
            const tm = escape(t?.time || "");
            const dur = escape(t?.duration || "");
            const notes = escape(t?.notes || "");
            return `<div><b>${topic}</b> — ${aud} <span class="muted">${tm}, ${dur} min</span><div class="small">${notes}</div></div>`;
          })}
        </div>

        <div class="section">
          <h2>Daily Schedule</h2>
          ${listArray(schedule, (s) => {
            const time = escape(s?.time || "");
            const text = escape(s?.text || "");
            return `<div><span class="mono">${time}</span> — ${text}</div>`;
          })}
        </div>

        <div class="section">
          <h2>Telephone & Correspondence</h2>
          ${listArray(comms, (c) => {
            const time = escape(c?.time || "");
            const name = escape(c?.contact || "");
            const subj = escape(c?.subject || "");
            const dir = escape(c?.direction || "");
            const act = escape(c?.action || "");
            return `<div><b>${name}</b> — ${subj} <span class="muted">${dir} at ${time}</span><div class="small">Action: ${act}</div></div>`;
          })}
        </div>

        <div class="section">
          <h2>Financial Notes & Charitable Receipts</h2>
          ${listArray(fins, (f) => {
            const time = escape(f?.time || "");
            const donor = escape(f?.donor || "");
            const purpose = escape(f?.purpose || "");
            const amount = escape(f?.amount || "");
            const notes = escape(f?.notes || "");
            return `<div><span class="mono">${time}</span> — <b>${donor}</b>: ${purpose} — $${amount}<div class="small">${notes}</div></div>`;
          })}
        </div>

        <div class="section">
          <h2>Pastoral Notes, Reflections & Thanksgiving</h2>
          <div class="small"><b>Observations:</b> ${escape(refs?.observations || "")}</div>
          <div class="small"><b>Gratitude:</b> ${escape(refs?.gratitude || "")}</div>
          <div class="small"><b>Intentions:</b> ${escape(refs?.intentions || "")}</div>
          <div class="divider">✦ ✦ ✦</div>
          <div class="small muted"><i>Evening Prayer of Examination</i></div>
          <div class="small">O Lord, grant me to see my own sins and not to judge my brother...</div>
        </div>
      </body>
    </html>
  `;
  return html;
};

export const generateDailyLogPDF = async (user, date, log) => {
  const html = renderDailyLogHTML(user, date, log);
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "12mm", bottom: "15mm", left: "12mm" }
    });
    return pdf;
  } finally {
    await browser.close();
  }
};