import axios from 'axios';

// 1. Define the base configuration
const api = axios.create({
  // Use an environment variable or your local URL
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
  
  // 🚨 CRITICAL: This allows the browser to send/receive the httpOnly cookie
  withCredentials: true, 
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add a "Response Interceptor" 
// This automatically redirects the user to login if the session expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and boot to login
      localStorage.removeItem('fleet_user');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;