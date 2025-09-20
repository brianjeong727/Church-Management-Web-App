// src/pages/Events.jsx
import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Events() {
  const { role, user } = useAuth();
  const isLeader = (role || "").toLowerCase() === "pastor" || (role || "").toLowerCase() === "deacon";
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ church: 1, title: "", starts_at: "", ends_at: "", location: "" });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await client.get("events/");
      setItems(data);
    } catch {
      setError("Failed to load events");
    }
  };

  useEffect(() => { load(); }, []);

  async function create() {
    setError("");
    try {
      const { data } = await client.post("events/", form);
      setItems([data, ...items]);
      setForm({ church: 1, title: "", starts_at: "", ends_at: "", location: "" });
    } catch {
      setError("Only pastors/deacons can create events.");
    }
  }

  async function update(ev, patch) {
    try {
      const { data } = await client.patch(`events/${ev.id}/`, patch);
      setItems(items.map(x => x.id === ev.id ? data : x));
    } catch {
      alert("Only the leader who created this event can edit it.");
    }
  }

  async function signup(ev) {
    try {
      await client.post("attendance/", { event: ev.id, status: "in" });
      alert("Signed up!");
    } catch {
      alert("Failed to sign up");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Events</h2>
      {isLeader && (
        <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
          <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
          <input placeholder="Starts (YYYY-MM-DDTHH:MM)" value={form.starts_at} onChange={e=>setForm({...form, starts_at:e.target.value})}/>
          <input placeholder="Ends (YYYY-MM-DDTHH:MM)" value={form.ends_at} onChange={e=>setForm({...form, ends_at:e.target.value})}/>
          <input placeholder="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/>
          <button onClick={create}>Create</button>
          
        </div>
      )}
      {error && <div style={{ color:"red" }}>{error}</div>}

      <ul style={{ marginTop: 16 }}>
        {items.map(ev => {
          const mine = ev.created_by?.username === user?.username;
          return (
            <li key={ev.id} style={{ marginBottom: 10 }}>
              <strong>{ev.title}</strong> — {ev.starts_at} → {ev.ends_at} @ {ev.location}
              <span style={{ opacity:.7 }}> (by {ev.created_by?.username})</span>
              <div style={{ marginTop: 6, display:"flex", gap:8 }}>
                {!isLeader && <button onClick={()=>signup(ev)}>Sign Up</button>}
                {isLeader && mine && (
                  <>
                    <button onClick={()=>update(ev, { title: prompt("New title:", ev.title) || ev.title })}>Edit Title</button>
                    {/* add more edit fields similarly if you want */}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}