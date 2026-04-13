import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import DailyLog from "../models/DailyLog.js";

/**
 * Search across all daily logs for a user.
 * Searches: sacrament types/recipients, pastoral persons/purposes,
 * teaching topics, prayer notes, reflections, admin notes, communications.
 */
export const searchLogsService = async (userId, query) => {
  if (!query || query.trim().length === 0) return [];

  const q = query.trim().toLowerCase();

  // Fetch all logs with content fields
  const docs = await DailyLog.find({ userId }).select(
    "date sacraments pastoralVisits teaching prayerNotes reflections admin communications financials"
  ).sort({ date: -1 });

  const results = [];

  for (const doc of docs) {
    const matches = [];

    // Search sacraments
    if (Array.isArray(doc.sacraments)) {
      for (const s of doc.sacraments) {
        const haystack = `${s.type || ""} ${s.recipient || ""} ${s.notes || ""}`.toLowerCase();
        if (haystack.includes(q)) {
          matches.push({
            type: "sacrament",
            label: s.type || "Sacrament",
            detail: s.recipient || "",
            snippet: s.notes || ""
          });
        }
      }
    }

    // Search pastoral visits
    if (Array.isArray(doc.pastoralVisits)) {
      for (const v of doc.pastoralVisits) {
        const haystack = `${v.person || ""} ${v.purpose || ""} ${v.notes || ""}`.toLowerCase();
        if (haystack.includes(q)) {
          matches.push({
            type: "pastoral",
            label: v.person || "Pastoral Visit",
            detail: v.purpose || "",
            snippet: v.notes || ""
          });
        }
      }
    }

    // Search teaching/sermons
    if (Array.isArray(doc.teaching)) {
      for (const t of doc.teaching) {
        const haystack = `${t.topic || ""} ${t.audience || ""} ${t.scripture || ""} ${t.notes || ""}`.toLowerCase();
        if (haystack.includes(q)) {
          matches.push({
            type: "teaching",
            label: t.topic || "Teaching",
            detail: t.audience || "",
            snippet: t.notes || ""
          });
        }
      }
    }

    // Search prayer notes
    if (doc.prayerNotes && doc.prayerNotes.toLowerCase().includes(q)) {
      matches.push({
        type: "prayer",
        label: "Prayer Notes",
        detail: "",
        snippet: doc.prayerNotes
      });
    }

    // Search reflections
    if (doc.reflections) {
      const haystack = `${doc.reflections.observations || ""} ${doc.reflections.gratitude || ""} ${doc.reflections.intentions || ""}`.toLowerCase();
      if (haystack.includes(q)) {
        const snippet = doc.reflections.observations || doc.reflections.gratitude || doc.reflections.intentions || "";
        matches.push({
          type: "reflection",
          label: "Reflection",
          detail: "",
          snippet
        });
      }
    }

    // Search communications
    if (Array.isArray(doc.communications)) {
      for (const c of doc.communications) {
        const haystack = `${c.contact || ""} ${c.subject || ""} ${c.action || ""}`.toLowerCase();
        if (haystack.includes(q)) {
          matches.push({
            type: "communication",
            label: c.contact || "Communication",
            detail: c.subject || "",
            snippet: c.action || ""
          });
        }
      }
    }

    if (matches.length > 0) {
      results.push({ date: doc.date, matches });
    }
  }

  return results;
};