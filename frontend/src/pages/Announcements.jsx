// src/pages/Announcements.jsx
import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Announcements() {
  const { user } = useAuth();
  const isLeader = user?.role === "pastor" || user?.role === "deacon";

  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    church: user?.church_id || 1,
    title: "",
    body: "",
  });
  const [error, setError] = useState("");

  // ------------------------------
  // LOAD ANNOUNCEMENTS
  // ------------------------------
  useEffect(() => {
    client
      .get("announcements/")
      .then((res) => setItems(res.data))
      .catch(() => setError("Failed to load announcements"));
  }, []);

  // ------------------------------
  // CREATE ANNOUNCEMENT
  // ------------------------------
  async function create() {
    setError("");
    try {
      const res = await client.post("announcements/", form);
      setItems([res.data, ...items]); // prepend
      setForm({ ...form, title: "", body: "" });
    } catch (err) {
      setError("Only pastors or deacons can post announcements.");
    }
  }

  // ------------------------------
  // DELETE ANNOUNCEMENT (LEADER ONLY)
  // ------------------------------
  async function deleteAnnouncement(id) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await client.delete(`announcements/${id}/`);
      setItems(items.filter((a) => a.id !== id));
    } catch (err) {
      setError("Only pastors or deacons can delete announcements.");
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Announcements</h1>

      {/* Leader-only form */}
      {isLeader && (
        <div className="mb-8 bg-white shadow p-4 rounded-lg space-y-3">
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Announcement Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="w-full border px-3 py-2 rounded"
            placeholder="Announcement Body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />

          <button
            onClick={create}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post Announcement
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-600 font-medium mb-4">{error}</p>
      )}

      {/* Announcements list */}
      <div className="space-y-4">
        {items.map((a) => (
          <div
            key={a.id}
            className="bg-white shadow p-4 rounded-lg border relative"
          >
            {/* DELETE BUTTON (leader only) */}
            {isLeader && (
              <button
                className="absolute top-3 right-3 text-red-600 hover:text-red-900 text-xl"
                onClick={() => deleteAnnouncement(a.id)}
              >
                ✕
              </button>
            )}

            <h2 className="text-xl font-semibold">{a.title}</h2>
            <p className="text-gray-700 mt-1">{a.body}</p>

            <p className="text-sm text-gray-500 mt-2">
              Posted by{" "}
              <span className="font-medium">
                {a.created_by?.full_name || a.created_by?.email}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
