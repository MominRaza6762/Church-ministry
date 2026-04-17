import mongoose from "mongoose";

const DailyLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    date: { type: String, index: true, required: true },

    // Worship
    liturgy: { type: Object, default: {} },

    // Prayer
    prayer: { type: Object, default: {} },
    prayerNotes: { type: String, default: "" },
    prayerRequestsHealth:   { type: Array, default: [] },
    prayerRequestsDeparted: { type: Array, default: [] },

    // Sacraments & Occasional Offices
    sacraments: { type: Array, default: [] },

    // Pastoral Care
    pastoralVisits:    { type: Array, default: [] },
    visitation:        { type: Array, default: [] },
    pastoralEducation: { type: Array, default: [] },
    pastoralMeetings:  { type: Array, default: [] },
    pastoralEvents:    { type: Array, default: [] },

    // Administration
    admin: { type: Array, default: [] },

    // Continuing Formation
    teaching:             { type: Array, default: [] },
    formationSermon:      { type: Array, default: [] },
    formationReading:     { type: Array, default: [] },
    formationVideos:      { type: Array, default: [] },
    formationRetreats:    { type: Array, default: [] },
    formationConferences: { type: Array, default: [] },
    formationResearch:    { type: Array, default: [] },

    // Schedule / Additional
    dailySchedule:  { type: Array, default: [] },
    communications: { type: Array, default: [] },
    taxExpenses:    { type: Object, default: {} },   // Tax & Ministry Expense Tracker
    financials:     { type: Array, default: [] },
    reflections:    { type: Object, default: {} },

    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyLog", DailyLogSchema);
