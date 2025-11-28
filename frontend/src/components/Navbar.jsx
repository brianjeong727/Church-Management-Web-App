import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const token = localStorage.getItem("access");
  const isLoggedIn = Boolean(user || token);

  return (
    <nav
      className="
        w-full 
        bg-[linear-gradient(90deg,#3b0764,#312e81)] 
        text-white 
        shadow-lg 
        px-8 py-4 
        flex items-center
      "
    >
      {/* LEFT — Brand */}
      <div className="flex items-center gap-3">
        {/* Clean minimal cross icon */}
        <div className="w-7 h-7 bg-white/15 rounded-md flex items-center justify-center border border-white/20 backdrop-blur-sm">
          <div
            className="w-4 h-4 border-2 border-white opacity-80"
            style={{ borderLeft: 'none', borderBottom: 'none' }}
          ></div>
        </div>

        <Link
          to="/"
          className="text-2xl font-bold tracking-wide hover:opacity-90 transition"
        >
          Central
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* RIGHT — Nav links OR auth buttons */}
      {isLoggedIn ? (
        <div className="flex items-center gap-8 text-lg font-medium">

          {/* Navigation */}
          <Link to="/" className="hover:text-purple-200 transition">
            Dashboard
          </Link>

          {/* NEW — Community Chat */}
          <Link to="/chat" className="hover:text-purple-200 transition">
            Community Chat
          </Link>
          
          <Link to="/announcements" className="hover:text-purple-200 transition">
            Announcements
          </Link>

          <Link to="/events" className="hover:text-purple-200 transition">
            Events
          </Link>

          <Link to="/attendance" className="hover:text-purple-200 transition">
            Attendance
          </Link>

          {/* Profile badge */}
          <div
            className="
              px-4 py-1 
              bg-white/10 
              border border-white/20 
              rounded-full 
              backdrop-blur-xl 
              text-sm font-medium
              shadow-sm
            "
          >
            {user?.full_name || user?.email}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="
              ml-4 px-4 py-2 rounded-lg 
              bg-white/10 
              text-white 
              border border-white/20
              backdrop-blur 
              hover:bg-white/20 
              transition
              font-medium
            "
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4 text-lg font-medium">
          <Link
            to="/login"
            className="
              px-4 py-2 rounded-lg 
              bg-white/20 hover:bg-white/30 
              transition shadow-sm
            "
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="
              px-4 py-2 rounded-lg 
              bg-purple-600 hover:bg-purple-700 
              shadow-md 
              transition
            "
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
