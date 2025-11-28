import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import client from "../api/client";

export default function Dashboard() {
  const { user } = useAuth();

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
    return () => (active = false);
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 bg-[linear-gradient(180deg,#3b0764,#312e81)] text-white">

      {/* HEADER */}
      <div className="text-center mb-12">
        {/* Cross icon */}
        <div className="mx-auto mb-6 w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur">
          <div
            className="w-8 h-8 border-2 border-white"
            style={{ borderLeft: "none", borderBottom: "none" }}
          ></div>
        </div>

        <h1 className="text-5xl font-extrabold tracking-wide">Central Dashboard</h1>

        <p className="text-purple-200 mt-3 text-lg">
          Welcome back, <span className="font-semibold text-white">{user?.full_name}</span> —
          <span className="capitalize"> {user?.role}</span> of{" "}
          <span className="font-semibold text-white">{user?.church}</span>.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-purple-200 text-center text-lg">Loading…</p>
      )}

      {/* FEATURE CARDS */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* Announcements */}
          <Link to="/announcements" className="group">
            <div
              className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl 
            shadow-xl border border-white/20 group-hover:bg-white/20 transition"
            >
              <h2 className="text-2xl font-semibold mb-2">Announcements</h2>
              <p className="text-purple-200">{counts.announcements} total</p>
              {isLeader && (
                <p className="text-purple-300 mt-2 font-medium">
                  You can create announcements
                </p>
              )}
            </div>
          </Link>

          {/* Events */}
          <Link to="/events" className="group">
            <div
              className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl 
            shadow-xl border border-white/20 group-hover:bg-white/20 transition"
            >
              <h2 className="text-2xl font-semibold mb-2">Events</h2>
              <p className="text-purple-200">{counts.events} events</p>
              {isLeader && (
                <p className="text-purple-300 mt-2 font-medium">
                  Manage church events
                </p>
              )}
            </div>
          </Link>

          {/* Attendance */}
          <Link to="/attendance" className="group">
            <div
              className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl 
            shadow-xl border border-white/20 group-hover:bg-white/20 transition"
            >
              <h2 className="text-2xl font-semibold mb-2">Attendance</h2>
              <p className="text-purple-200">
                {isLeader ? "View attendance records" : "Check yourself in"}
              </p>
            </div>
          </Link>
        </div>
      )}

      <p className="text-purple-300 mt-16 text-center">
        Use the cards above to navigate your tools.
      </p>
    </div>
  );
}
