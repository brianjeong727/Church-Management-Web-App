// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const BASE_AUTH = import.meta.env.VITE_API_AUTH || "http://127.0.0.1:8000/api";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [viewAsMember, setViewAsMember] = useState(false); 
  // boot from localStorage on refresh
  useEffect(() => {
    const t = localStorage.getItem("access");
    const u = localStorage.getItem("username");
    const r = localStorage.getItem("role");
    if (t && u) {
      setUser({ username: u });
      if (r) setRole(r);
    }
  }, []);

  async function fetchRole(churchId = 1) {
    try {
      const { data } = await axios.get(
        `${BASE_AUTH}/churches/${churchId}/my_role/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setRole(data.role);
      localStorage.setItem("role", data.role || "");
    } catch (e) {
      // non-fatal if role lookup fails
      console.warn("fetchRole failed", e?.response?.data || e.message);
    }
  }

  async function login(username, password) {
    const { data } = await axios.post(`${BASE_AUTH}/token/`, { username, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("username", username);
    setUser({ username });
    await fetchRole(1);
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
  }

  return (
    <AuthCtx.Provider value={{ user, role, login, logout, viewAsMember, setViewAsMember}}>
      {children}
    </AuthCtx.Provider>
  );
}