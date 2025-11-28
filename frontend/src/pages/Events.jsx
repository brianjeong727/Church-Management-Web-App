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
    location: "",
  });

  // ---------------------------------------------------
  // LOAD EVENTS
  // ---------------------------------------------------
  useEffect(() => {
    client
      .get("events/")
      .then((res) => setItems(res.data))
      .catch(() => setError("Failed to load events"));
  }, []);

  // ---------------------------------------------------
  // CREATE EVENT
  // ---------------------------------------------------
  async function createEvent() {
    setError("");
    try {
      const res = await client.post("events/", form);
      setItems([res.data, ...items]);

      setForm({
        title: "",
        starts_at: "",
        ends_at: "",
        location: "",
      });
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Only pastors or deacons can create events.");
      } else if (err.response?.status === 400) {
        const detail = err.response.data.error || JSON.stringify(err.response.data);
        setError(`Invalid event data: ${detail}`);
      } else {
        setError("Failed to create event.");
      }
    }
  }

  // ---------------------------------------------------
  // DELETE EVENT
  // ---------------------------------------------------
  async function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;

    try {
      await client.delete(`events/${id}/`);
      setItems(items.filter((event) => event.id !== id));
    } catch {
      setError("Only pastors or deacons can delete events.");
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-[linear-gradient(180deg,#312e81,#3b0764)] text-white">

      {/* Title Section */}
      <div className="text-center mb-10 animate-fadeIn">
        <h1 className="text-4xl font-extrabold tracking-wide">Events</h1>
        <p className="text-purple-200 mt-2 text-lg">
          Plan, gather, and grow together as a community.
        </p>
      </div>

      {/* Leader Form */}
      {isLeader && (
        <div
          className="max-w-xl mx-auto mb-12 p-6 bg-white/10 border border-white/20 
          backdrop-blur-xl rounded-2xl shadow-xl space-y-4 animate-fadeIn"
        >
          <input
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 
            text-white placeholder-purple-200 focus:bg-white/20 outline-none transition"
            placeholder="Event Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="flex gap-4">
            <input
              type="datetime-local"
              className="w-1/2 px-4 py-3 rounded-lg bg-white/10 border border-white/30 
              text-white focus:bg-white/20 outline-none transition"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />

            <input
              type="datetime-local"
              className="w-1/2 px-4 py-3 rounded-lg bg-white/10 border border-white/30 
              text-white focus:bg-white/20 outline-none transition"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            />
          </div>

          <input
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 
            text-white placeholder-purple-200 focus:bg-white/20 outline-none transition"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <button
            onClick={createEvent}
            className="w-full py-3 bg-purple-600/70 rounded-lg border border-white/20 
            font-semibold text-white hover:bg-purple-600 transition shadow"
          >
            Create Event
          </button>

          {error && <p className="text-red-300 font-medium mt-2">{error}</p>}
        </div>
      )}

      {!isLeader && (
        <p className="text-center text-purple-200 italic mb-6">
          Only pastors or deacons can create events.
        </p>
      )}

      {/* Events List */}
      <div className="max-w-2xl mx-auto space-y-6">
        {items.length === 0 && (
          <p className="text-center text-purple-200 text-lg animate-fadeIn">
            No events yet.
          </p>
        )}

        {items.map((e, i) => (
          <div
            key={e.id}
            className="relative bg-white/10 border border-white/20 p-6 
            rounded-2xl backdrop-blur-xl shadow-xl animate-fadeIn 
            hover:bg-white/20 transition"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Delete button */}
            {isLeader && (
              <button
                onClick={() => deleteEvent(e.id)}
                className="absolute top-3 right-3 text-red-300 hover:text-red-400 
                bg-white/10 w-8 h-8 flex items-center justify-center 
                rounded-full border border-white/20 backdrop-blur-xl transition"
              >
                ✕
              </button>
            )}

            <h2 className="text-2xl font-semibold">{e.title}</h2>

            <p className="text-purple-100 mt-1">{e.location}</p>

            <p className="text-sm text-purple-300 mt-3">
              Starts:{" "}
              <span className="font-medium text-white">
                {new Date(e.starts_at).toLocaleString()}
              </span>
            </p>

            <p className="text-sm text-purple-300">
              Ends:{" "}
              <span className="font-medium text-white">
                {new Date(e.ends_at).toLocaleString()}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
