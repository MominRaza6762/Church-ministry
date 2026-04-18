import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { weeklySummaryService, monthlySummaryService, weeklyDetailService } from "../services/logService.js";

export const weekly = async (req, res) => {
  try {
    const date = req.query?.date || new Date();
    const data = await weeklySummaryService(req.user?._id, date);
    res.json({ report: data });
  } catch (e) {
    res.status(500).json({ error: "Failed to compute weekly summary" });
  }
};

export const monthly = async (req, res) => {
  try {
    const date = req.query?.date || new Date();
    const data = await monthlySummaryService(req.user?._id, date);
    res.json({ report: data });
  } catch (e) {
    res.status(500).json({ error: "Failed to compute monthly summary" });
  }
};

// GET /api/reports/weekly/detail?date=...&category=sacraments|visits|worship|teaching|prayer
export const weeklyDetail = async (req, res) => {
  try {
    const date = req.query?.date || new Date();
    const category = req.query?.category || "sacraments";
    const data = await weeklyDetailService(req.user?._id, date, category);
    res.json({ detail: data });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch detail" });
  }
};