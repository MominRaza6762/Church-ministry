import express from "express";
import { body } from "express-validator";
import { getLog, upsertLog, updateSection, history } from "../controllers/logsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:date", requireAuth, getLog);
router.put("/:date", requireAuth, upsertLog);
router.patch(
  "/:date/section",
  requireAuth,
  body("section").isString().notEmpty(),
  updateSection
);
router.get("/history", requireAuth, history);

export default router;