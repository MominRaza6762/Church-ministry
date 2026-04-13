import http from "./http.js";

export const weeklyReportApi = async (date) => {
  const res = await http.get("/reports/weekly", { params: { date } });
  return res.data;
};

export const monthlyReportApi = async (date) => {
  const res = await http.get("/reports/monthly", { params: { date } });
  return res.data;
};