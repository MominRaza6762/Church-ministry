import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { validationResult } from "express-validator";
import {
  getLogService,
  upsertLogService,
  updateSectionService,
  historyService
} from "../services/logService.js";

export const getLog = async (req, res) => {
  try {
    const date = req.params?.date || "";
    const log = await getLogService(req.user?._id, date);
    res.json({ log: log || null });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch log" });
  }
};

export const upsertLog = async (req, res) => {
  try {
    const date = req.params?.date || "";
    const payload = req.body || {};
    const log = await upsertLogService(req.user?._id, date, payload);
    res.json({ log });
  } catch (e) {
    res.status(500).json({ error: "Failed to save log" });
  }
};

export const updateSection = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });
    const date = req.params?.date || "";
    const section = req.body?.section || "";
    const data = req.body?.data || {};
    const log = await updateSectionService(req.user?._id, date, section, data);
    res.json({ log });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Failed to update section" });
  }
};

export const history = async (req, res) => {
  try {
    const dates = await historyService(req.user?._id);
    res.json({ dates });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};