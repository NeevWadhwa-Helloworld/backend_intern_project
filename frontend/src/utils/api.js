import axios from 'axios';

// Create Axios instance with base path and credential support for HttpOnly cookies
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Empty keeps local Docker/dev proxy behavior
  withCredentials: true // CRITICAL: Allows browser to save & send HTTP-Only session cookies
});

export default api;
