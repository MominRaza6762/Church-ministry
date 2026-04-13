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
  const update = {
    ...payload,
    updatedAt: new Date()
  };
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
    "liturgy",
    "prayer",
    "prayerNotes",
    "sacraments",
    "pastoralVisits",
    "admin",
    "teaching",
    "dailySchedule",
    "communications",
    "financials",
    "reflections"
  ];
  if (!allowed.includes(section)) {
    throw { status: 400, message: "Invalid section" };
  }
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
    const litValues = Object.values(lit);
    for (let i = 0; i < litValues.length; i++) {
      const v = litValues[i];
      if (v && typeof v === "object" && (v.completed === true || v.served === true)) offices += 1;
    }
    const pr = doc.prayer || {};
    const prValues = Object.values(pr);
    for (let i = 0; i < prValues.length; i++) {
      const v = prValues[i];
      if (v === true) prayerChecks += 1;
    }
    if (Array.isArray(doc.sacraments)) sacraments += doc.sacraments.length;
    if (Array.isArray(doc.pastoralVisits)) visits += doc.pastoralVisits.length;
  });
  return { range: { start, end }, totals: { offices, prayerChecks, sacraments, visits } };
};

export const monthlySummaryService = async (userId, date) => {
  const { start, end } = getMonthRange(date);
  const docs = await DailyLog.find({ userId, date: { $gte: start, $lte: end } });
  const days = [];
  const distribution = { offices: 0, sacraments: 0, visits: 0, admin: 0, teaching: 0 };
  docs.forEach(doc => {
    days.push(doc.date);
    const lit = doc.liturgy || {};
    const litValues = Object.values(lit);
    for (let i = 0; i < litValues.length; i++) {
      const v = litValues[i];
      if (v && typeof v === "object" && (v.completed === true || v.served === true)) distribution.offices += 1;
    }
    if (Array.isArray(doc.sacraments)) distribution.sacraments += doc.sacraments.length;
    if (Array.isArray(doc.pastoralVisits)) distribution.visits += doc.pastoralVisits.length;
    const admin = doc.admin || {};
    const adminValues = Object.values(admin);
    for (let i = 0; i < adminValues.length; i++) {
      if (adminValues[i] && adminValues[i].done === true) distribution.admin += 1;
    }
    if (Array.isArray(doc.teaching)) distribution.teaching += doc.teaching.length;
  });
  return { range: { start, end }, days, distribution };
};