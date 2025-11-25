// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import client from "../api/client";

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Normalize role safely
  const role = user?.role?.toLowerCase() || null;
  const isLeader = role === "pastor" || role === "deacon";

  const [counts, setCounts] = useState({
    announcements: 0,
    events: 0,
  });

  const [loading, setLoading] = useState(true);

  // Load counts
  useEffect(() => {
    let active = true;

    async function loadCounts() {
      try {
        const [aRes, eRes] = await Promise.all([
          client.get("announcements/"),
          client.get("events/"),
        ]);

        if (active) {
          setCounts({
            announcements: aRes.data.length,
            events: eRes.data.length,
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCounts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-4">Church Dashboard</h1>

      {/* User Info */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <p className="text-gray-700">
          Signed in as{" "}
          <span className="font-semibold">
            {user?.full_name || user?.email}
          </span>
        </p>

        <p className="text-gray-600">
          Role:{" "}
          <span className="font-semibold capitalize">
            {user?.role || "N/A"}
          </span>
        </p>

        <p className="text-gray-600">
          Church:{" "}
          <span className="font-semibold">
            {user?.church || "N/A"}
          </span>
        </p>

        <button
          onClick={logout}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Loading…</p>}

      {/* Main Actions */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Announcements */}
          <Link to="/announcements">
            <div className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-1">Announcements</h2>
              <p className="text-gray-600">{counts.announcements} total</p>

              {isLeader && (
                <p className="text-blue-600 font-medium mt-1">
                  You can create announcements
                </p>
              )}
            </div>
          </Link>

          {/* Events */}
          <Link to="/events">
            <div className="p-4 bg-green-50 hover:bg-green-100 rounded-lg shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-1">Events</h2>
              <p className="text-gray-600">{counts.events} events</p>

              {isLeader && (
                <p className="text-green-700 font-medium mt-1">
                  You can create & manage events
                </p>
              )}
            </div>
          </Link>

          {/* Attendance */}
          <Link to="/attendance">
            <div className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-1">Attendance</h2>

              <p className="text-gray-600">
                {isLeader
                  ? "View all attendance"
                  : "Check yourself in"}
              </p>
            </div>
          </Link>
        </div>
      )}

      <p className="text-gray-500 mt-8 text-center">
        Welcome! Use the cards above to navigate your church tools.
      </p>
    </div>
  );
}
