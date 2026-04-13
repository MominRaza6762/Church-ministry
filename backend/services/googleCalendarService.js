import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { google } from "googleapis";
import User from "../models/User.js";
import { encryptJSON, decryptJSON } from "../utils/encryptUtils.js";
import { signStateToken, verifyStateToken } from "../utils/tokenUtils.js";
import { toYYYYMMDD } from "../utils/dateUtils.js";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  CLIENT_URL
} = process.env;

const scopes = ["https://www.googleapis.com/auth/calendar.readonly"];

const buildOAuthClient = () => {
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
};

export const getAuthUrlService = (userId) => {
  const oauth2Client = buildOAuthClient();
  const state = signStateToken({ uid: userId });
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state
  });
  return url;
};

export const handleOAuthCallbackService = async (code, state) => {
  const payload = verifyStateToken(state || "");
  if (!payload?.uid) throw { status: 400, message: "Invalid state parameter" };
  const oauth2Client = buildOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens?.access_token) throw { status: 400, message: "Failed to get tokens from Google" };
  const user = await User.findById(payload.uid);
  if (!user) throw { status: 404, message: "User not found" };
  user.googleTokens = encryptJSON(tokens);
  await user.save();
  return `${CLIENT_URL || "http://localhost:5173"}/settings?gcal=connected`;
};

export const getTodayEventsService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  const stored = decryptJSON(user.googleTokens || "");
  if (!stored || !stored.access_token) {
    throw { status: 400, message: "Google Calendar not connected" };
  }

  const oauth2Client = buildOAuthClient();
  oauth2Client.setCredentials(stored);

  // Auto-refresh token if expired
  oauth2Client.on("tokens", async (newTokens) => {
    try {
      const merged = { ...stored, ...newTokens };
      const freshUser = await User.findById(userId);
      if (freshUser) {
        freshUser.googleTokens = encryptJSON(merged);
        await freshUser.save();
      }
    } catch (e) {
      console.error("Token refresh save error:", e.message);
    }
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  let resp;
  try {
    resp = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50
    });
  } catch (err) {
    // If token is invalid/revoked, clear stored tokens
    if (err?.response?.status === 401 || err?.code === 401) {
      try {
        const staleUser = await User.findById(userId);
        if (staleUser) {
          staleUser.googleTokens = "";
          await staleUser.save();
        }
      } catch {}
      throw { status: 401, message: "Google Calendar authorization expired. Please reconnect." };
    }
    throw { status: 500, message: err?.message || "Failed to fetch calendar events" };
  }

  const items = resp.data.items || [];
  const events = items.map(ev => ({
    id: ev.id,
    summary: ev.summary || "(No title)",
    start: ev.start?.dateTime || ev.start?.date || "",
    end: ev.end?.dateTime || ev.end?.date || ""
  }));

  // Map events to schedule time slots — only exact hour slots (HH:00)
  const slots = [];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (!ev.start) continue;
    const d = new Date(ev.start);
    if (isNaN(d.getTime())) continue;
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    // Use exact time for display, but also add a rounded hour slot
    slots.push({ time: `${hh}:${mm}`, text: ev.summary });
  }

  return { date: toYYYYMMDD(now), events, slots };
};