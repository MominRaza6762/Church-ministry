import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { searchLogs } from "../controllers/searchController.js";

const router = express.Router();

// GET /api/search?q=your+query
router.get("/", requireAuth, searchLogs);

export default router;