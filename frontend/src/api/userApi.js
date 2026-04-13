import http from "./http.js";

export const updateProfileApi = async (data) => {
  const res = await http.put("/users/profile", data);
  return res.data;
};