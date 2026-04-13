import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { exportPDF } from "../controllers/exportController.js";

const router = express.Router();

router.get("/pdf/:date", requireAuth, exportPDF);

export default router;