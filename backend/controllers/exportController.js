import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { getLogService } from "../services/logService.js";
import { generateDailyLogPDF } from "../services/pdfService.js";
import { toYYYYMMDD } from "../utils/dateUtils.js";

export const exportPDF = async (req, res) => {
  try {
    const date = req.params?.date || "";
    const key = toYYYYMMDD(date);
    const log = await getLogService(req.user?._id, key);
    const user = req.user || {};
    const pdf = await generateDailyLogPDF(user, key, log || {});
    const filename = `Ministry_Log_${key}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (e) {
    console.error("PDF export error:", e.message);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};