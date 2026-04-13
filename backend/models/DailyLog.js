import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });
import mongoose from "mongoose";

const DailyLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    date: { type: String, index: true, required: true }, // YYYY-MM-DD
    liturgy: { type: Object, default: {} },
    prayer: { type: Object, default: {} },
    prayerNotes: { type: String, default: "" },
    sacraments: { type: Array, default: [] },
    pastoralVisits: { type: Array, default: [] },
    admin: { type: Object, default: {} },
    teaching: { type: Array, default: [] },
    dailySchedule: { type: Array, default: [] },
    communications: { type: Array, default: [] },
    financials: { type: Array, default: [] },
    reflections: { type: Object, default: {} },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyLog", DailyLogSchema);