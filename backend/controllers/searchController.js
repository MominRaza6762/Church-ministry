import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { searchLogsService } from "../services/searchService.js";

export const searchLogs = async (req, res) => {
  try {
    const query = req.query?.q || "";
    if (!query.trim()) return res.json({ results: [] });
    const results = await searchLogsService(req.user?._id, query);
    res.json({ results });
  } catch (e) {
    console.error("Search error:", e.message);
    res.status(500).json({ error: "Search failed" });
  }
};