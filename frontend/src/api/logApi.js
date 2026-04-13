import http from "./http.js";

export const getLogApi = async (date) => {
  const res = await http.get(`/logs/${date}`);
  return res.data;
};

export const upsertLogApi = async (date, payload) => {
  const res = await http.put(`/logs/${date}`, payload);
  return res.data;
};

export const updateSectionApi = async (date, section, data) => {
  const res = await http.patch(`/logs/${date}/section`, { section, data });
  return res.data;
};

export const historyApi = async () => {
  const res = await http.get("/logs/history");
  return res.data;
};