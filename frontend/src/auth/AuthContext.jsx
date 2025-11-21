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
    const email = localStorage.getItem("email");
    const r = localStorage.getItem("role");

    if (t && email) {
      setUser({ email });
      if (r) setRole(r);
    }
  }, []);

  async function fetchRole(churchId = 1) {
    try {
      const { data } = await axios.get(
        `${BASE_AUTH}/churches/${churchId}/my_role/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setRole(data.role);
      localStorage.setItem("role", data.role || "");
    } catch (e) {
      console.warn("fetchRole failed", e?.response?.data || e.message);
    }
  }

  async function login(email, password) {
    // IMPORTANT: backend now expects { email, password }
    const { data } = await axios.post(`${BASE_AUTH}/token/`, {
      email,
      password,
    });

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("email", email);

    setUser({ email });

    await fetchRole(1);
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    setUser(null);
    setRole(null);
  }

  return (
    <AuthCtx.Provider
      value={{ user, role, login, logout, viewAsMember, setViewAsMember }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
