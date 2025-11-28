// src/api/client.js
import axios from "axios";

// Prefer environment variable; fallback to local dev API URL
const BASE_URL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// ========= AUTH REQUEST INTERCEPTOR ========= //
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========= TOKEN REFRESH LOGIC ========= //
let isRefreshing = false;
let queuedRequests = [];

// Add a request to queue (waiting for new token)
const subscribeToRefresh = (cb) => {
  queuedRequests.push(cb);
};

// Execute all queued requests after token refresh
const processQueue = (newToken) => {
  queuedRequests.forEach((cb) => cb(newToken));
  queuedRequests = [];
};

// ========= RESPONSE INTERCEPTOR ========= //
client.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    // Only try refreshing access token when:
    // - Response is 401
    // - We didn't already retry this request
    if (
      error.response &&
      error.response.status === 401 &&
      !original._retry
    ) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        return Promise.reject(error); // No refresh token → logout
      }

      // If refresh is already in progress → queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeToRefresh((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(original));
          });
        });
      }

      // Start a refresh
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${BASE_URL.replace(/\/$/, "")}/token/refresh/`,
          { refresh }
        );

        const newAccess = response.data.access;
        localStorage.setItem("access", newAccess);

        isRefreshing = false;
        processQueue(newAccess);

        // Retry original request with new token
        original.headers.Authorization = `Bearer ${newAccess}`;
        return client(original);
      } catch (refreshError) {
        isRefreshing = false;

        // Refresh token expired → logout fully
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
