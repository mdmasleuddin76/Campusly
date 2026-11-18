import axios from "axios";

// Base URL comes from VITE_API_URL in frontend/.env.
// Empty in development -> "/api", which Vite forwards to http://localhost:5000.
// When deployed, set VITE_API_URL=https://your-backend.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // send the login cookie on every request
});

// Turns any API error into a readable message for toasts
export const errorMessage = (err) =>
  err?.response?.data?.message ||
  (err?.request && !err?.response ? "Can't reach the server. Is the backend running?" : null) ||
  "Something went wrong. Please try again.";

export default api;
