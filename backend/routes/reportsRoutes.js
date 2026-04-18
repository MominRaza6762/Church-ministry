import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { weekly, monthly, weeklyDetail } from "../controllers/reportsController.js";

const router = express.Router();

router.get("/weekly", requireAuth, weekly);
router.get("/monthly", requireAuth, monthly);
router.get("/weekly/detail", requireAuth, weeklyDetail);

export default router;