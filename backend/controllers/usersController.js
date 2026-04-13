import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { updateProfileService } from "../services/userService.js";
import { changePasswordService } from "../services/authService.js";
import { validationResult } from "express-validator";

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    const user = await updateProfileService(req.user?._id, req.body || {});
    res.json({ user });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Failed to update profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    await changePasswordService(req.user?._id, currentPassword, newPassword);
    res.json({ success: true });
  } catch (e) {
    res.status(e.status || 400).json({ error: e.message || "Unable to change password" });
  }
};
