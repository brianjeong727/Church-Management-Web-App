// src/pages/Attendance.jsx
import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Attendance() {
  const { role } = useAuth();
  const isLeader = (role || "").toLowerCase() === "pastor" || (role || "").toLowerCase() === "deacon";
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    client.get("events/").then(r=>setEvents(r.data));
  }, []);

  useEffect(() => {
    if (!eventId) return;
    client.get(`attendance/?event=${eventId}`).then(r=>setRows(r.data));
  }, [eventId]);

  const selectedTitle = events.find(e=>String(e.id)===String(eventId))?.title;

  return (
    <div style={{ padding: 16 }}>
      <h2>Attendance</h2>

      <label>
        Event:{" "}
        <select value={eventId} onChange={(e)=>setEventId(e.target.value)}>
          <option value="">Select event…</option>
          {events.map(e=> <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </label>

      {eventId && (
        <>
          <h3 style={{ marginTop: 16 }}>{selectedTitle}</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  <th style={th}>User</th>
                  <th style={th}>Status</th>
                  <th style={th}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r=>(
                  <tr key={r.id}>
                    <td style={td}>{r.user?.username}</td>
                    <td style={td}>{r.status}</td>
                    <td style={td}>{new Date(r.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td style={td} colSpan={3}>(No signups yet)</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {!isLeader && (
            <button style={{ marginTop: 10 }} onClick={async ()=>{
              await client.post("attendance/", { event: Number(eventId), status: "in" });
              const { data } = await client.get(`attendance/?event=${eventId}`);
              setRows(data);
            }}>
              Sign Up / Check In
            </button>
          )}
        </>
      )}
    </div>
  );
}

const th = { textAlign:"left", borderBottom:"1px solid #ddd", padding:"8px" };
const td = { borderBottom:"1px solid #f0f0f0", padding:"8px" };