// src/api.js (Corrected)
import axios from "axios";

// Read raw env value (Vite)
const rawApiUrl = import.meta.env.VITE_API_URL || "";

// Trim trailing slash if present so we never produce double slashes later
const normalizedEnvUrl = rawApiUrl.replace(/\/+$/, "");

// Fallback to localhost for local development
export const API_URL = normalizedEnvUrl || "http://localhost:5000";
console.log("[api] using API_URL:", API_URL);

// Create Axios Instance (This remains the authenticated instance for all other calls)
const API = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

// ... (keep setAuthToken and readTokenFromLocalStorage functions here) ...

// Request interceptor: (keep the interceptor logic here)
API.interceptors.request.use((config) => {
  // ... (keep the existing logic for reading token from localStorage and logging) ...
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 💡 FIX HERE: Use base axios and the API_URL to make an UN-AUTHENTICATED request
export const getHealth = async () => {
  // Call the root URL '/' for an unauthenticated health check, bypassing the 'API' instance
  const res = await axios.get(`${API_URL}/`);
  return res.data;
};

export default API;