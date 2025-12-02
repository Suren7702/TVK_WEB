import axios from "axios";

// Read API URL
const rawApiUrl = import.meta.env.VITE_API_URL || "";
export const API_URL = rawApiUrl.replace(/\/+$/, "") || "https://tvk-web.onrender.com";

// Read API key from Vercel env
const CLIENT_API_KEY = (import.meta.env.VITE_API_KEY || "").trim();
console.log("[api] CLIENT_API_KEY exists:", !!CLIENT_API_KEY);

// Create Axios instance
const API = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    ...(CLIENT_API_KEY ? { "x-api-key": CLIENT_API_KEY } : {})
  }
});

// Export instance
export default API;
