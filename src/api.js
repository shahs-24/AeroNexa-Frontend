import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8082/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("airline_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || data?.error || error?.message || "Something went wrong.";
}

export default api;