// src/pages/Announcements.jsx
import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Announcements() {
  const { role, viewAsMember, setViewAsMember } = useAuth();
  const isLeader = (role || "").toLowerCase() === "pastor" || (role || "").toLowerCase() === "deacon";
  const effectiveLeader = isLeader && !viewAsMember;
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ church: 1, title: "", body: "" });
  const [error, setError] = useState("");
  
  useEffect(() => {
    client.get("announcements/").then(r => setItems(r.data)).catch(()=>setError("Failed to load announcements"));
  }, []);

  async function create() {
    setError("");
    try {
      const { data } = await client.post("announcements/", form);
      setItems([data, ...items]);
      setForm({ church: 1, title: "", body: "" });
    } catch {
      setError("Only pastors/deacons can post.");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Announcements</h2>
      {isLeader && (
        <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
          <input value={form.title} placeholder="Title" onChange={e=>setForm({...form, title:e.target.value})}/>
          <textarea value={form.body} placeholder="Body" onChange={e=>setForm({...form, body:e.target.value})}/>
          <button onClick={create}>Post</button>
        </div>
      )}
      {error && <div style={{ color:"red" }}>{error}</div>}
      <ul style={{ marginTop: 16 }}>
        {items.map(a=>(
          <li key={a.id} style={{marginBottom:8}}>
            <strong>{a.title}</strong> — {a.body} <em style={{opacity:.7}}>by {a.created_by?.username}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
