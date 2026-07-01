import axios from 'axios';

// Create Axios instance with base path and credential support for HttpOnly cookies
const api = axios.create({
  baseURL: '', // Relative URL routes through Vite dev proxy
  withCredentials: true // CRITICAL: Allows browser to save & send HTTP-Only session cookies
});

export default api;
