// src/auth/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client"; // ← our axios instance

const AuthContext = createContext(null);

function safeParse(v) {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => safeParse(localStorage.getItem("user")));
  const [access, setAccess] = useState(localStorage.getItem("access"));
  const [refresh, setRefresh] = useState(localStorage.getItem("refresh"));

  // ======================================================
  // LOGIN
  // ======================================================
  const login = async (email, password) => {
    const res = await client.post("/token/", { email, password });

    const { access: a, refresh: r, user: u } = res.data;
    if (!u) throw new Error("Backend did not return user object");

    // Store user + tokens
    localStorage.setItem("access", a);
    localStorage.setItem("refresh", r);
    localStorage.setItem("user", JSON.stringify(u));

    setAccess(a);
    setRefresh(r);
    setUser(u);

    return u;
  };

  // ======================================================
  // LOGOUT
  // ======================================================
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    setAccess(null);
    setRefresh(null);
    setUser(null);
  };

  // ======================================================
  // REGISTER CHURCH
  // ======================================================
  const registerChurch = async (formData) => {
    const res = await client.post("/auth/register_church/", formData);

    const { access: a, refresh: r, user: u } = res.data;

    // Save user as pastor of church
    localStorage.setItem("access", a);
    localStorage.setItem("refresh", r);
    localStorage.setItem("user", JSON.stringify(u));

    setAccess(a);
    setRefresh(r);
    setUser(u);

    return u;
  };

  // ======================================================
  // REGISTER MEMBER
  // ======================================================
  const registerMember = async (formData) => {
    const res = await client.post("/auth/register_member/", formData);

    const { access: a, refresh: r, user: u } = res.data;

    localStorage.setItem("access", a);
    localStorage.setItem("refresh", r);
    localStorage.setItem("user", JSON.stringify(u));

    setAccess(a);
    setRefresh(r);
    setUser(u);

    return u;
  };

  // ======================================================
  // TOKEN AUTO-REFRESH EVERY 4 MINUTES
  // ======================================================
  useEffect(() => {
    if (!refresh) return;

    const interval = setInterval(async () => {
      try {
        const res = await client.post("/token/refresh/", { refresh });
        const newAccess = res.data.access;

        localStorage.setItem("access", newAccess);
        setAccess(newAccess);
      } catch (err) {
        logout(); // refresh expired
      }
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{
        user,
        access,
        refresh,
        login,
        logout,
        registerChurch,
        registerMember
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
