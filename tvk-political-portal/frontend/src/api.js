import axios from "axios";

// 1. Dynamic Base URL
// It checks for a deployed URL first. If not found, it defaults to localhost.
const API_URL = import.meta.env.VITE_API_URL || "/api"; // Just /api

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for CORS and secure cookies
});

// 2. Auth Token Helper
// Call this function after login to attach the token to all future requests
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

export default API;