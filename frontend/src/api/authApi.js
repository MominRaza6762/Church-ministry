import http from "./http.js";

export const registerApi = async (data) => {
  const res = await http.post("/auth/register", data);
  return res.data;
};

export const loginApi = async (data) => {
  const res = await http.post("/auth/login", data);
  return res.data;
};

export const meApi = async () => {
  const res = await http.get("/auth/me");
  return res.data;
};

export const logoutApi = async () => {
  const res = await http.post("/auth/logout");
  return res.data;
};

export const changePasswordApi = async (data) => {
  const res = await http.put("/users/password", data);
  return res.data;
};
