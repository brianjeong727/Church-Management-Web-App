// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const redirectTo = (loc.state && loc.state.from) || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      nav(redirectTo, { replace: true });
    } catch (err) {
      // show exactly what the server sent back to debug
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed";
      console.error("Login error:", err?.response || err);
      setError(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: "4rem auto", display: "grid", gap: 12 }}>
      <h2>Sign in</h2>
      <input placeholder="Username" value={username} onChange={(e) => setU(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setP(e.target.value)} />
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}