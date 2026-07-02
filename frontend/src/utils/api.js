import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

// Create Axios instance with base path and credential support for HttpOnly cookies
const api = axios.create({
  baseURL,
  withCredentials: true // CRITICAL: Allows browser to save & send HTTP-Only session cookies
});

export default api;
