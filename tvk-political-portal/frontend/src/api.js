import axios from "axios";

// Read raw env value (Vite)
const rawApiUrl = import.meta.env.VITE_API_URL || "";

// ... (keep the rest of the setup logic here) ...

// Fallback to localhost for local development
export const API_URL = normalizedEnvUrl || "http://localhost:5000";
console.log("[api] using API_URL:", API_URL);

// 💡 FIX HERE: Get the secret key from your client's environment variables
// IMPORTANT: Make sure you have VITE_API_SECRET_KEY set in your frontend's .env file.
const CLIENT_API_KEY = import.meta.env.VITE_API_SECRET_KEY;


// Create Axios Instance
const API = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  
  // 💡 THIS IS THE COPY & PASTE FIX: Add the header globally to all requests
  headers: {
    'x-api-key': CLIENT_API_KEY, 
  }
});

// ... (keep setAuthToken, readTokenFromLocalStorage, and the interceptor below this) ...


// Example health helper (still bypasses the global API instance)
export const getHealth = async () => {
  // This uses base axios, so it bypasses the security check. Good!
  const res = await axios.get(`${API_URL}/`);
  return res.data;
};

export default API;