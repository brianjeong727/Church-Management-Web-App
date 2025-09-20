// src/auth/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
  const { user } = useAuth();
  const token = localStorage.getItem("access");
  const loc = useLocation();
  if (!user && !token) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return children;
}