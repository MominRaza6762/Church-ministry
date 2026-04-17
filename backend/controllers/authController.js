import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { validationResult } from "express-validator";
import {
  registerService,
  loginService,
  refreshService,
  logoutService,
  meService,
  changePasswordService
} from "../services/authService.js";

const isProd = process.env.NODE_ENV === "production";

const setRefreshCookie = (res, token) => {
  res.cookie("rt", token, {
    httpOnly: true,
    secure: true,                          // always secure (required for sameSite none)
    sameSite: isProd ? "none" : "lax",     // "none" for cross-domain in production
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie("rt", {
    httpOnly: true,
    secure: true,
    sameSite: isProd ? "none" : "lax",
    path: "/"
  });
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    const { email, password, name, parishName } = req.body || {};
    const { user, accessToken, refreshToken } = await registerService({ email, password, name, parishName });
    setRefreshCookie(res, refreshToken);
    res.json({ user, accessToken });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    const { email, password } = req.body || {};
    const { user, accessToken, refreshToken } = await loginService({ email, password });
    setRefreshCookie(res, refreshToken);
    res.json({ user, accessToken });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Login failed" });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.rt || "";
    const { accessToken } = await refreshService(token);
    res.json({ accessToken });
  } catch (e) {
    res.status(e.status || 401).json({ error: e.message || "Unable to refresh" });
  }
};

export const logout = async (req, res) => {
  try {
    await logoutService(req.user?._id);
    clearRefreshCookie(res);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Logout failed" });
  }
};

export const me = async (req, res) => {
  try {
    const me = await meService(req.user?._id);
    res.json({ user: me });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Failed to fetch user" });
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
