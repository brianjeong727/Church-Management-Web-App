// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import client from "../api/client";

export default function Dashboard() {
  const { user, role, logout } = useAuth();
  const [counts, setCounts] = useState({ announcements: 0, events: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [a, e] = await Promise.all([
          client.get("announcements/"),
          client.get("events/"),
        ]);
        if (mounted) setCounts({ announcements: a.data.length, events: e.data.length });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Church Dashboard</h1>
      <p>
        Signed in as <strong>{user?.username}</strong>
        {role ? <> — role: <strong>{role}</strong></> : null}
      </p>
      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <Link to="/announcements"><button>Announcements ({counts.announcements})</button></Link>
        <Link to="/events"><button>Events ({counts.events})</button></Link>
        <Link to="/attendance"><button>Attendance</button></Link>
        <button onClick={logout} style={{ marginLeft: "auto" }}>Logout</button>
      </div>
      {loading && <div>Loading…</div>}
      {!loading && <p>Welcome! Use the buttons above to manage and view content.</p>}
    </div>
  );
}