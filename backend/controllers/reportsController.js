import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { weeklySummaryService, monthlySummaryService } from "../services/logService.js";

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