import axios from "axios";

// -------------------------------------------
// 1️⃣ API Base URL (Vercel → Vite Environment Variable)
// -------------------------------------------
// This reads your environment variable defined in Vercel:
// VITE_API_URL = https://your-backend.onrender.com
//
// If you ever test locally without .env, it falls back to localhost.
// -------------------------------------------

const API_URL = import.meta.env.VITE_API_URL || "https://tvk-web.onrender.com/";

// Create Axios Instance
const API = axios.create({
  baseURL: API_URL, 
  withCredentials: true, // For secure cookies or auth headers
});

// -------------------------------------------
// 2️⃣ Attach Auth Token (Reusable for Login)
// -------------------------------------------
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// -------------------------------------------
// 3️⃣ Example Health Check Function
// -------------------------------------------
export const getHealth = async () => {
  const res = await API.get("/api/health");
  return res.data;
};

export default API;
