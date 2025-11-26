// src/api/api.js
import axios from "axios";

// Create a new axios instance
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1", // Your backend API base URL
});

// ------------------------------------------------------------------
// This is the important part: an "interceptor"
// It runs BEFORE every request is sent
// ------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from local storage
    const token = localStorage.getItem("authToken");

    // 2. If the token exists, add it to the 'Authorization' header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

export default api;
