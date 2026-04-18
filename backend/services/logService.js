import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import DailyLog from "../models/DailyLog.js";
import { getWeekRange, getMonthRange, toYYYYMMDD } from "../utils/dateUtils.js";

export const getLogService = async (userId, date) => {
  const key = toYYYYMMDD(date);
  const doc = await DailyLog.findOne({ userId, date: key });
  return doc || null;
};

export const upsertLogService = async (userId, date, payload) => {
  const key = toYYYYMMDD(date);
  const update = { ...payload, updatedAt: new Date() };
  const doc = await DailyLog.findOneAndUpdate(
    { userId, date: key },
    { $set: update, $setOnInsert: { userId, date: key } },
    { upsert: true, new: true }
  );
  return doc;
};

export const updateSectionService = async (userId, date, section, data) => {
  const key = toYYYYMMDD(date);
  const allowed = [
    "liturgy", "prayer", "prayerNotes", "sacraments", "pastoralVisits",
    "admin", "teaching", "dailySchedule", "communications", "financials", "reflections"
  ];
  if (!allowed.includes(section)) throw { status: 400, message: "Invalid section" };
  const setPath = {};
  setPath[section] = data;
  setPath.updatedAt = new Date();
  const doc = await DailyLog.findOneAndUpdate(
    { userId, date: key },
    { $set: setPath, $setOnInsert: { userId, date: key } },
    { upsert: true, new: true }
  );
  return doc;
};

export const historyService = async (userId) => {
  const docs = await DailyLog.find({ userId }).select("date liturgy prayer sacraments pastoralVisits admin teaching");
  return docs.map(d => d.date);
};

export const weeklySummaryService = async (userId, date) => {
  const { start, end } = getWeekRange(date);
  const docs = await DailyLog.find({ userId, date: { $gte: start, $lte: end } });
  let offices = 0;
  let prayerChecks = 0;
  let sacraments = 0;
  let visits = 0;
  docs.forEach(doc => {
    const lit = doc.liturgy || {};
    Object.values(lit).forEach(v => {
      if (v && typeof v === "object" && (v.completed === true || v.served === true)) offices += 1;
    });
    Object.values(doc.prayer || {}).forEach(v => { if (v === true) prayerChecks += 1; });
    if (Array.isArray(doc.sacraments)) sacraments += doc.sacraments.length;
    if (Array.isArray(doc.pastoralVisits)) visits += doc.pastoralVisits.length;
  });
  return { range: { start, end }, totals: { offices, prayerChecks, sacraments, visits } };
};

// NEW: Returns itemized detail for a given category in a date range
export const weeklyDetailService = async (userId, date, category) => {
  const { start, end } = getWeekRange(date);
  const docs = await DailyLog.find({ userId, date: { $gte: start, $lte: end } })
    .select("date liturgy prayer sacraments pastoralVisits teaching admin")
    .sort({ date: 1 });

  const items = [];

  docs.forEach(doc => {
    const d = doc.date;

    if (category === "sacraments" && Array.isArray(doc.sacraments)) {
      doc.sacraments.forEach(s => {
        items.push({
          date: d,
          type: s.type || "",
          recipient: s.recipient || "",
          location: s.location || "",
          time: s.time || "",
          notes: s.notes || ""
        });
      });
    }

    if (category === "visits" && Array.isArray(doc.pastoralVisits)) {
      doc.pastoralVisits.forEach(v => {
        items.push({
          date: d,
          category: v.category || "",
          subcategory: v.subcategory || "",
          person: v.person || v.place || "",
          time: v.time || "",
          purpose: v.purpose || "",
          notes: v.notes || ""
        });
      });
    }

    if (category === "worship") {
      const lit = doc.liturgy || {};
      const services = Array.isArray(lit.services) ? lit.services : [];
      services.forEach(s => {
        items.push({ date: d, service: s.service || "", time: s.time || "", notes: s.notes || "" });
      });
      // legacy format support
      if (services.length === 0) {
        Object.entries(lit).forEach(([k, v]) => {
          if (v && typeof v === "object" && (v.completed || v.served)) {
            items.push({ date: d, service: k, time: v.actual || "", notes: "" });
          }
        });
      }
    }

    if (category === "teaching" && Array.isArray(doc.teaching)) {
      doc.teaching.forEach(t => {
        const firstVal = t[Object.keys(t).find(k => k !== "activityType") || ""] || "";
        items.push({
          date: d,
          activityType: t.activityType || "",
          summary: firstVal,
          notes: t.notes || ""
        });
      });
    }

    if (category === "prayer") {
      const pr = doc.prayer || {};
      const checked = Object.entries(pr)
        .filter(([, v]) => v === true)
        .map(([k]) => k.replace(/^[ME]:/, ""));
      if (checked.length > 0) {
        items.push({ date: d, items: checked, count: checked.length });
      }
    }
  });

  return { range: { start, end }, category, items };
};

export const monthlySummaryService = async (userId, date) => {
  const { start, end } = getMonthRange(date);
  const docs = await DailyLog.find({ userId, date: { $gte: start, $lte: end } });
  const days = [];
  const distribution = { offices: 0, sacraments: 0, visits: 0, admin: 0, teaching: 0 };
  docs.forEach(doc => {
    days.push(doc.date);
    Object.values(doc.liturgy || {}).forEach(v => {
      if (v && typeof v === "object" && (v.completed === true || v.served === true)) distribution.offices += 1;
    });
    if (Array.isArray(doc.sacraments)) distribution.sacraments += doc.sacraments.length;
    if (Array.isArray(doc.pastoralVisits)) distribution.visits += doc.pastoralVisits.length;
    const admin = doc.admin || {};
    const entries = Array.isArray(admin.entries) ? admin.entries : Object.values(admin);
    entries.forEach(v => { if (v && (v.done === true)) distribution.admin += 1; });
    if (Array.isArray(doc.teaching)) distribution.teaching += doc.teaching.length;
  });
  return { range: { start, end }, days, distribution };
};