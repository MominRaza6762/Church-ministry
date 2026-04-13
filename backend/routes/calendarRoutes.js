import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { startAuth, oauthCallback, calendarStatus, disconnectCalendar, todayEvents } from "../controllers/calendarController.js";

const router = express.Router();

router.get("/auth", requireAuth, startAuth);
router.get("/callback", oauthCallback);
router.get("/status", requireAuth, calendarStatus);
router.post("/disconnect", requireAuth, disconnectCalendar);
router.get("/events", requireAuth, todayEvents);

export default router;
