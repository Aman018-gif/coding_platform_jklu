import axios from "axios";

const API_BASE = "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
