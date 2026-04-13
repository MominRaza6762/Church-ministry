import http from "./http.js";

export const searchApi = async (query) => {
  const res = await http.get(`/search?q=${encodeURIComponent(query)}`);
  return res.data;
};