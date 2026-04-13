import http from "./http.js";

export const startGoogleOAuth = async () => {
  try {
    const res = await http.get("/calendar/auth");
    const url = res.data?.url || "";
    if (url) {
      window.location.href = url;
    } else {
      throw new Error("No redirect URL received");
    }
  } catch (e) {
    const msg = e?.response?.data?.error || e?.message || "Failed to connect Google Calendar";
    throw new Error(msg);
  }
};

export const calendarStatusApi = async () => {
  const res = await http.get("/calendar/status");
  return res.data;
};

export const disconnectCalendarApi = async () => {
  const res = await http.post("/calendar/disconnect");
  return res.data;
};

export const todayEventsApi = async () => {
  const res = await http.get("/calendar/events");
  return res.data;
};
