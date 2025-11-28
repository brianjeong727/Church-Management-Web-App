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

  // --------------------------------------------------
  // LOAD ANNOUNCEMENTS
  // --------------------------------------------------
  useEffect(() => {
    client
      .get("announcements/")
      .then((res) => setItems(res.data))
      .catch(() => setError("Failed to load announcements"));
  }, []);

  // --------------------------------------------------
  // CREATE ANNOUNCEMENT
  // --------------------------------------------------
  async function create() {
    setError("");
    try {
      const res = await client.post("announcements/", form);
      setItems([res.data, ...items]);
      setForm({ ...form, title: "", body: "" });
    } catch (err) {
      setError("Only pastors or deacons can post announcements.");
    }
  }

  // --------------------------------------------------
  // DELETE ANNOUNCEMENT
  // --------------------------------------------------
  async function deleteAnnouncement(id) {
    if (!confirm("Delete this announcement?")) return;

    try {
      await client.delete(`announcements/${id}/`);
      setItems(items.filter((a) => a.id !== id));
    } catch (err) {
      setError("Only pastors or deacons can delete announcements.");
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-[linear-gradient(180deg,#3b0764,#312e81)] text-white">
      
      {/* Header */}
      <div className="text-center mb-10 animate-fadeIn">
        <div className="mx-auto mb-4 w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
          <div
            className="w-7 h-7 border-2 border-white rotate-0"
            style={{ borderLeft: "none", borderBottom: "none" }}
          ></div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-wide">Announcements</h1>
        <p className="text-purple-200 mt-2 text-lg">
          Stay up to date with what’s happening in your community.
        </p>
      </div>

      {/* Leader-only announcement form */}
      {isLeader && (
        <div
          className="max-w-xl mx-auto mb-12 p-6 bg-white/10 border border-white/20 
        backdrop-blur-xl rounded-2xl shadow-xl space-y-4 animate-fadeIn"
        >
          <input
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 
            text-white placeholder-purple-200 focus:bg-white/20 outline-none transition"
            placeholder="Announcement Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="w-full px-4 py-3 h-32 rounded-lg bg-white/10 border border-white/30 
            text-white placeholder-purple-200 focus:bg-white/20 outline-none transition"
            placeholder="Announcement Body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />

          <button
            onClick={create}
            className="w-full py-3 bg-white/20 border border-white/20 rounded-lg 
            font-semibold text-white hover:bg-white/30 backdrop-blur-xl 
            transition shadow"
          >
            Post Announcement
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-red-300 text-center font-medium mb-4">
          {error}
        </p>
      )}

      {/* Announcements list */}
      <div className="max-w-2xl mx-auto space-y-6">
        {items.map((a, i) => (
          <div
            key={a.id}
            className="relative bg-white/10 border border-white/20 p-6 
            rounded-2xl backdrop-blur-xl shadow-xl animate-fadeIn 
            hover:bg-white/20 transition"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Delete button (leader only) */}
            {isLeader && (
              <button
                onClick={() => deleteAnnouncement(a.id)}
                className="absolute top-3 right-3 text-red-300 hover:text-red-400 
                bg-white/10 w-8 h-8 flex items-center justify-center 
                rounded-full border border-white/20 backdrop-blur-xl transition"
              >
                ✕
              </button>
            )}

            <h2 className="text-2xl font-semibold mb-1">{a.title}</h2>
            <p className="text-purple-100 leading-relaxed">{a.body}</p>

            <p className="text-sm text-purple-300 mt-4">
              Posted by{" "}
              <span className="font-semibold text-white">
                {a.created_by?.full_name || a.created_by?.email}
              </span>
            </p>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-center text-purple-200 text-lg mt-10 animate-fadeIn">
            No announcements yet.
          </p>
        )}
      </div>
    </div>
  );
}
