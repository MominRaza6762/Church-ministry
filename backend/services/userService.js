import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import User from "../models/User.js";

export const updateProfileService = async (userId, data) => {
  const update = {
    name: data?.name || "",
    parishName: data?.parishName || "",
    preferences: data?.preferences || {}
  };
  const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select("_id email name parishName role preferences");
  return user;
};