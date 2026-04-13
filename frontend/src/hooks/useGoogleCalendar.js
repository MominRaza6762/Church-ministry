import { useState } from "react";
import { todayEventsApi } from "../api/calendarApi.js";

export const useGoogleCalendar = () => {
  const [events, setEvents] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true); setError("");
    try {
      const data = await todayEventsApi();
      setEvents(data.events || []);
      setSlots(data.slots || []);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to fetch Google Calendar events");
    } finally {
      setLoading(false);
    }
  };

  return { events, slots, loading, error, refresh };
};