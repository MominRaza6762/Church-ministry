import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { weekly, monthly } from "../controllers/reportsController.js";

const router = express.Router();

router.get("/weekly", requireAuth, weekly);
router.get("/monthly", requireAuth, monthly);

export default router;