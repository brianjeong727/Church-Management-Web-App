// src/auth/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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

  // ---------------- LOGIN -----------------
  const login = async (email, password) => {
    const res = await axios.post("http://127.0.0.1:8000/api/token/", {
      email,
      password,
    });

    console.log("LOGIN RAW RESPONSE:", res.data);

    const { access: a, refresh: r, user: u } = res.data;

    if (!u) {
      console.error("❌ BACKEND DID NOT RETURN USER FIELD!");
    }

    // SAVE FULL USER
    setUser(u);
    setAccess(a);
    setRefresh(r);

    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("access", a);
    localStorage.setItem("refresh", r);

    return u;
  };


  // ---------------- LOGOUT -----------------
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setAccess(null);
    setRefresh(null);
  };

  // ---------------- TOKEN REFRESH -----------------
  useEffect(() => {
    if (!refresh) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh }
        );

        setAccess(res.data.access);
        localStorage.setItem("access", res.data.access);
      } catch {
        logout();
      }
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, access, refresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
