// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";

import Navbar from "./components/Navbar";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupMember from "./pages/SignupMember";
import SignupChurch from "./pages/SignupChurch";
import ChooseChurch from "./pages/ChooseChurch";

// Protected pages
import Dashboard from "./pages/Dashboard";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Attendance from "./pages/Attendance";
import CommunityChat from "./pages/CommunityChat";   // <-- NEW

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* Multi-step signup pages */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/member" element={<SignupMember />} />
          <Route path="/signup/member/church" element={<ChooseChurch />} />
          <Route path="/signup/church" element={<SignupChurch />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
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

          {/* NEW: Community Chat page */}
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <CommunityChat />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
