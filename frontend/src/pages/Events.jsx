// src/pages/Events.jsx
import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Events() {
  const { user } = useAuth();
  const isLeader = user?.role === "pastor" || user?.role === "deacon";

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    starts_at: "",
    ends_at: "",
    location: ""
  });

  // ------------------------------
  // LOAD EVENTS
  // ------------------------------
  useEffect(() => {
    client
      .get("events/")
      .then((res) => setItems(res.data))
      .catch(() => setError("Failed to load events"));
  }, []);

  // ------------------------------
  // CREATE EVENT
  // ------------------------------
  async function createEvent() {
    setError("");

    try {
      const res = await client.post("events/", form);
      setItems([res.data, ...items]);

      setForm({
        title: "",
        starts_at: "",
        ends_at: "",
        location: ""
      });
    } catch (err) {
      console.log("ERR:", err.response?.data);

      if (err.response?.status === 403) {
        setError("Only pastors or deacons can create events.");
      } else if (err.response?.status === 400) {
        // Backend validation errors
        const detail =
          err.response.data.error ||
          JSON.stringify(err.response.data);

        setError(`Invalid event data: ${detail}`);
      } else {
        setError("Failed to create event.");
      }
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Events</h1>

      {/* Leader-only form */}
      {isLeader && (
        <div className="mb-8 bg-white shadow p-4 rounded-lg space-y-3">
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Event Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            type="datetime-local"
            className="w-full border px-3 py-2 rounded"
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
          />

          <input
            type="datetime-local"
            className="w-full border px-3 py-2 rounded"
            value={form.ends_at}
            onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
          />

          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <button
            onClick={createEvent}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Event
          </button>

          {error && (
            <p className="text-red-600 font-medium mt-2">{error}</p>
          )}
        </div>
      )}

      {/* Non-leader message */}
      {!isLeader && (
        <p className="text-red-600 mb-4">Only pastors/deacons can create events.</p>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {items.length === 0 && <p>No events yet.</p>}

        {items.map((e) => (
          <div key={e.id} className="bg-white shadow p-4 rounded-lg border">
            <h2 className="text-xl font-semibold">{e.title}</h2>
            <p className="text-gray-700 mt-1">{e.location}</p>
            <p className="text-gray-500 text-sm mt-2">
              Starts: {new Date(e.starts_at).toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm">
              Ends: {new Date(e.ends_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
