// src/api/client.js
import axios from "axios";

// Prefer env var. Fallback to local dev.
const BASE_URL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/";

const client = axios.create({
  baseURL: BASE_URL
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Try refreshing token if we get a 401
let isRefreshing = false;
let pending = [];

function subscribeTokenRefresh(cb) {
  pending.push(cb);
}
function onRefreshed(newToken) {
  pending.forEach((cb) => cb(newToken));
  pending = [];
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    // If unauthorized and we haven't retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      !original._retry
    ) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (!refresh) {
        // no refresh token → log out upstream
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // queue until refresh finishes
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshRes = await axios.post(
          `${BASE_URL.replace(/\/$/, "")}/token/refresh/`,
          { refresh }
        );
        const newAccess = refreshRes.data.access;
        localStorage.setItem("access", newAccess);
        isRefreshing = false;
        onRefreshed(newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return client(original);
      } catch (e) {
        isRefreshing = false;
        // refresh failed → clear tokens
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
