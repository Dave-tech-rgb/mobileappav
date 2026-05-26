import axios from "axios";

// Using environment variable for dynamic IP configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

export const authAPI = {
  register: (email: string, password: string) => api.post("/auth/register/", { email, password }),
  login: (email: string, password: string) => api.post("/auth/login/", { email, password }),
};

export const userAPI = {
  getAll: () => api.get("/users/"),
  add: (name: string, role: string) => api.post("/users/", { name, role }),
  remove: (id: string | number) => api.delete(`/users/${id}/`),
  updateRole: (id: string | number, role: string) => api.patch(`/users/${id}/`, { role }),
};

export const auditAPI = {
  getAll: () => api.get("/audit-logs/"),
  add: (action: string, user: string, role: string) => api.post("/audit-logs/", { action, user, role }),
};

export const deviceAPI = {
  getAll: () => api.get("/devices/"),
  add: (name: string, location: string, deviceId: string) => api.post("/devices/", { name, location, deviceId }),
  remove: (id: string | number) => api.delete(`/devices/${id}/`),
  updateStatus: (id: string | number, status: string) => api.patch(`/devices/${id}/`, { status }),
};

export const detectionAPI = {
  detect: (formData: FormData) => api.post("/detection/detect", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),
  getStats: () => api.get("/detection/stats"),
  getLogs: () => api.get("/detection/logs"),
  saveSession: (formData: FormData) => api.post("/detection/save", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),
};

export default api;
