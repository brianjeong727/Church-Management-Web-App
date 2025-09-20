// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AuthProvider from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Attendance from "./pages/Attendance";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
          <Link to="/">Dashboard</Link>
          <Link to="/announcements">Announcements</Link>
          <Link to="/events">Events</Link>
          <Link to="/attendance">Attendance</Link>
          <div style={{ flex: 1 }} />
          <Link to="/login">Login</Link>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/announcements"
            element={
              <RequireAuth>
                <Announcements />
              </RequireAuth>
            }
          />
          <Route
            path="/events"
            element={
              <RequireAuth>
                <Events />
              </RequireAuth>
            }
          />
          <Route
            path="/attendance"
            element={
              <RequireAuth>
                <Attendance />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}