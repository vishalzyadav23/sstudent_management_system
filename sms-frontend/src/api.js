import axios from 'axios';

// Create a custom axios instance pointing to your Spring Boot server
const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
});

// --- GLOBAL INTERCEPTOR ---
// This automatically grabs your JWT token from local storage and 
// attaches it to the headers of EVERY request sent to the backend.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;