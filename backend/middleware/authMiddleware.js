import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { verifyAccessToken } from "../utils/tokenUtils.js";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers?.authorization || "";
    const parts = auth.split(" ");
    const token = parts.length === 2 && parts[0] === "Bearer" ? parts[1] : "";
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const payload = verifyAccessToken(token);
    if (!payload?._id) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const user = await User.findById(payload._id).select("_id email name parishName role");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (e) {
    console.error("Auth middleware error:", e.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};