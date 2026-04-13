import axios from "axios";
import API_BASE_URL from "../utils/apiBase.js";

const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

let isRefreshing = false;
let pendingQueue = [];
let _getToken = () => "";
let _setToken = () => {};
let _clearAuth = () => {};

export const registerAuthHandlers = (getToken, setToken, clearAuth) => {
  _getToken = getToken;
  _setToken = setToken;
  _clearAuth = clearAuth;
};

const processQueue = (error, token = null) => {
  const queue = [...pendingQueue];
  pendingQueue = [];
  queue.forEach(p => error ? p.reject(error) : p.resolve(token));
};

http.interceptors.request.use((config) => {
  const token = _getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error?.response?.status;
    const url = original.url || "";
    const isAuthEndpoint =
      url.includes("/auth/refresh") ||
      url.includes("/auth/login") ||
      url.includes("/auth/logout");

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${token}`;
          original._retry = true;
          return http(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const resp = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = resp.data?.accessToken || "";
        _setToken(newToken);
        processQueue(null, newToken);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch (e) {
        processQueue(e, null);
        _clearAuth();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default http;
