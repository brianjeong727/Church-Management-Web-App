import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const token = localStorage.getItem("access");
  const isLoggedIn = user || token;

  return (
    <nav className="flex items-center px-6 py-4 border-b bg-white shadow-sm">
      {/* Left: Navigation links */}
      <div className="flex items-center gap-8 font-medium text-lg">
        <Link to="/" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/announcements" className="hover:text-blue-600">Announcements</Link>
        <Link to="/events" className="hover:text-blue-600">Events</Link>
        <Link to="/attendance" className="hover:text-blue-600">Attendance</Link>
      </div>

      {/* Push right side to edge */}
      <div className="flex-1" />

      {/* Right side */}
      {!isLoggedIn ? (
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            Sign Up
          </Link>
        </div>
      ) : (
        <button
          onClick={logout}
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
        >
          Logout
        </button>
      )}
    </nav>
  );
}
