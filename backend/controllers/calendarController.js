import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { getAuthUrlService, handleOAuthCallbackService, getTodayEventsService } from "../services/googleCalendarService.js";
import { calendarStatusService } from "../services/authService.js";

export const startAuth = async (req, res) => {
  try {
    const url = getAuthUrlService(req.user?._id?.toString());
    res.json({ url });
  } catch (e) {
    res.status(500).json({ error: "Failed to initiate Google OAuth" });
  }
};

export const oauthCallback = async (req, res) => {
  try {
    const code = req.query?.code || "";
    const state = req.query?.state || "";
    const redirectUrl = await handleOAuthCallbackService(code, state);
    res.redirect(redirectUrl);
  } catch (e) {
    console.error("OAuth callback error:", e.message);
    res.status(e.status || 500).json({ error: e.message || "OAuth failed" });
  }
};

export const calendarStatus = async (req, res) => {
  try {
    const status = await calendarStatusService(req.user?._id);
    res.json(status);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Failed to get calendar status" });
  }
};

export const disconnectCalendar = async (req, res) => {
  try {
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(req.user?._id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.googleTokens = "";
    await user.save();
    res.json({ connected: false });
  } catch (e) {
    res.status(500).json({ error: "Failed to disconnect Google Calendar" });
  }
};

export const todayEvents = async (req, res) => {
  try {
    const data = await getTodayEventsService(req.user?._id);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Failed to fetch events" });
  }
};
