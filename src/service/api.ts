import axios from "axios";

// Using hardcoded local WiFi IP to bypass stubborn Expo .env caching!
const API_BASE_URL = "http://192.168.1.101:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
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

export default api;
