import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });
import mongoose from "mongoose";

const PreferencesSchema = new mongoose.Schema(
  {
    liturgySchedule: { type: Object, default: {} },
    prayerRule: { type: Object, default: {} },
    theme: { type: String, default: "parchment" }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    parishName: { type: String, default: "" },
    role: { type: String, enum: ["priest", "admin", "deacon", "bishop"], default: "priest" },
    googleTokens: { type: String, default: "" }, // encrypted JSON string
    preferences: { type: PreferencesSchema, default: () => ({}) },
    refreshToken: { type: String, default: "" },
    subscriptionTier: { type: String, default: "free" },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export default mongoose.model("User", UserSchema);