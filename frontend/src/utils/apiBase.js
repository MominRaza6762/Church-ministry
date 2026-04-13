const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : "http://localhost:3000/api");

export default API_BASE_URL;