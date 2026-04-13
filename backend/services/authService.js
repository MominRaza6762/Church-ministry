import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokenUtils.js";

const SALT_ROUNDS = 12;

export const registerService = async ({ email, password, name, parishName }) => {
  const existing = await User.findOne({ email });
  if (existing) throw { status: 400, message: "Email already registered" };
  if (!password || password.length < 8) throw { status: 400, message: "Password must be at least 8 characters" };
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, passwordHash: hash, name: name || "", parishName: parishName || "" });
  const accessToken = signAccessToken({ _id: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ _id: user._id.toString() });
  user.refreshToken = refreshToken;
  await user.save();
  return {
    user: { _id: user._id, email: user.email, name: user.name, parishName: user.parishName, role: user.role, googleCalendarConnected: false },
    accessToken,
    refreshToken
  };
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw { status: 400, message: "Invalid credentials" };
  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) throw { status: 400, message: "Invalid credentials" };
  const accessToken = signAccessToken({ _id: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ _id: user._id.toString() });
  user.refreshToken = refreshToken;
  await user.save();
  const googleCalendarConnected = !!(user.googleTokens && user.googleTokens.length > 10);
  return {
    user: { _id: user._id, email: user.email, name: user.name, parishName: user.parishName, role: user.role, googleCalendarConnected },
    accessToken,
    refreshToken
  };
};

export const refreshService = async (token) => {
  const payload = verifyRefreshToken(token);
  if (!payload?._id) throw { status: 401, message: "Invalid refresh token" };
  const user = await User.findById(payload._id);
  if (!user || user.refreshToken !== token) throw { status: 401, message: "Invalid session" };
  const accessToken = signAccessToken({ _id: user._id.toString(), role: user.role });
  return { accessToken };
};

export const logoutService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;
  user.refreshToken = "";
  await user.save();
};

export const meService = async (userId) => {
  const user = await User.findById(userId).select("_id email name parishName role preferences googleTokens");
  if (!user) throw { status: 404, message: "User not found" };
  const googleCalendarConnected = !!(user.googleTokens && user.googleTokens.length > 10);
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    parishName: user.parishName,
    role: user.role,
    preferences: user.preferences,
    googleCalendarConnected
  };
};

export const calendarStatusService = async (userId) => {
  const user = await User.findById(userId).select("googleTokens");
  if (!user) throw { status: 404, message: "User not found" };
  const connected = !!(user.googleTokens && user.googleTokens.length > 10);
  return { connected };
};

export const changePasswordService = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  const ok = await bcrypt.compare(currentPassword || "", user.passwordHash);
  if (!ok) throw { status: 400, message: "Current password incorrect" };
  if (!newPassword || newPassword.length < 8) throw { status: 400, message: "New password must be at least 8 characters" };
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
  return true;
};
