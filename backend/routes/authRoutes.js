import express from "express";
import { body } from "express-validator";
import { register, login, refresh, logout, me, changePassword } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  register
);

router.post(
  "/login",
  authLimiter,
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  login
);

router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.put("/password", requireAuth, body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 8 }), changePassword);

export default router;