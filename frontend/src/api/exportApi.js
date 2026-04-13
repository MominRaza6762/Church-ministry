import http from "./http.js";

export const exportPdfApi = async (date) => {
  const res = await http.get(`/export/pdf/${date}`, { responseType: "blob" });
  return res.data;
};
