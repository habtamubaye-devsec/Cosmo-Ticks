import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true,
});

export const getAuditLogs = async ({ page = 1, limit = 25 } = {}) => {
  const res = await API.get("/logs", { params: { page, limit } });
  return res.data; // { data, meta }
};
