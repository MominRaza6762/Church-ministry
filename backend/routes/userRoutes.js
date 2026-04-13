import express from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/authMiddleware.js";
import { updateProfile } from "../controllers/usersController.js";
import { changePassword } from "../controllers/authController.js";

const router = express.Router();

router.put(
  "/profile",
  requireAuth,
  body("name").optional().isString(),
  body("parishName").optional().isString(),
  updateProfile
);

router.put(
  "/password",
  requireAuth,
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 8 }),
  changePassword
);

export default router;