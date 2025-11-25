// src/pages/Events.jsx
import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Events() {
  const { user } = useAuth();

  const isLeader =
    user?.role === "pastor" || user?.role === "deacon";

  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    church: user?.church_id || 1,
    title: "",
    starts_at: "",
    ends_at: "",
    location: "",
  });

  const [error, setError] = useState("");

  // ---------- LOAD EVENTS ----------
  const load = async () => {
    try {
      const { data } = await client.get("events/");
      setItems(data);
    } catch {
      setError("Failed to load events");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ---------- CREATE EVENT (LEADER ONLY) ----------
  async function create() {
    setError("");
    try {
      const { data } = await client.post("events/", form);
      setItems([data, ...items]);
      setForm({
        church: user?.church_id || 1,
        title: "",
        starts_at: "",
        ends_at: "",
        location: "",
      });
    } catch {
      setError("Only pastors/deacons can create events.");
    }
  }

  // ---------- UPDATE EVENT (ONLY CREATOR) ----------
  async function update(ev, patch) {
    try {
      const { data } = await client.patch(`events/${ev.id}/`, patch);
      setItems(items.map((x) => (x.id === ev.id ? data : x)));
    } catch {
      alert("Only the leader who created this event can edit it.");
    }
  }

  // ---------- MEMBER SIGN-UP ----------
  async function signup(ev) {
    try {
      await client.post("attendance/", { event: ev.id, status: "in" });
      alert("You are checked in!");
    } catch {
      alert("Failed to sign in.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">Events</h2>

      {/* CREATE EVENT */}
      {isLeader && (
        <div className="bg-white shadow p-4 rounded-lg mb-6 space-y-3">
          <h3 className="font-semibold text-lg">Create New Event</h3>

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Event Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Starts — YYYY-MM-DDTHH:MM"
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Ends — YYYY-MM-DDTHH:MM"
            value={form.ends_at}
            onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <button
            onClick={create}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Create Event
          </button>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* EVENTS LIST */}
      <div className="space-y-4">
        {items.map((ev) => {
          const createdByMe = ev?.created_by?.email === user?.email;

          return (
            <div
              key={ev.id}
              className="bg-white shadow rounded-lg p-4 space-y-2"
            >
              <h3 className="text-xl font-semibold">{ev.title}</h3>

              <p className="text-gray-600">
                {ev.starts_at} → {ev.ends_at}
              </p>
              <p className="text-gray-600">Location: {ev.location}</p>

              <p className="text-gray-500 text-sm">
                Created by: <strong>{ev.created_by?.full_name}</strong>
              </p>

              <div className="flex gap-3 mt-2">
                {/* MEMBER SIGN UP */}
                {!isLeader && (
                  <button
                    onClick={() => signup(ev)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Check In
                  </button>
                )}

                {/* LEADER EDIT OWN EVENT */}
                {isLeader && createdByMe && (
                  <button
                    onClick={() =>
                      update(ev, {
                        title: prompt("Edit title:", ev.title) || ev.title,
                      })
                    }
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit Title
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-gray-500 text-center">No events yet.</p>
        )}
      </div>
    </div>
  );
}
