import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE = import.meta.env.VITE_API_AUTH || "http://127.0.0.1:8000/api";

export default function ChooseChurch() {
  const [myChurches, setMyChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinId, setJoinId] = useState("");
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [error, setError] = useState("");

  const nav = useNavigate();

  useEffect(() => {
    fetchMine();
  }, []);

  async function fetchMine() {
    try {
      const token = localStorage.getItem("access");
      const { data } = await axios.get(`${BASE}/churches/mine/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyChurches(data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Error loading churches");
    }
    setLoading(false);
  }

  function selectChurch(churchId) {
    localStorage.setItem("churchId", churchId);
    nav("/dashboard");
  }

  async function joinChurch(e) {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("access");
      const { data } = await axios.post(
        `${BASE}/churches/join/`,
        { church_id: joinId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Immediately select the church after joining
      localStorage.setItem("churchId", data.id);
      nav("/dashboard");
    } catch (err) {
      console.error("Join failed", err?.response || err);
      setError(err?.response?.data?.detail || "Failed to join church");
    }
  }

  async function createChurch(e) {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("access");
      const { data } = await axios.post(
        `${BASE}/churches/`,
        { name: newName, location: newLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // User becomes pastor of the new church → select it
      localStorage.setItem("churchId", data.id);
      nav("/dashboard");
    } catch (err) {
      console.error("Create failed", err?.response || err);
      setError(err?.response?.data?.detail || "Failed to create church");
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Loading churches...</p>;

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", display: "grid", gap: 20 }}>
      <h2>Choose Your Church</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Existing churches */}
      {myChurches.length > 0 && (
        <div>
          <h3>Your Churches</h3>
          {myChurches.map((c) => (
            <div
              key={c.church_id}
              onClick={() => selectChurch(c.church_id)}
              style={{
                padding: 12,
                marginBottom: 10,
                border: "1px solid #ccc",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <strong>{c.church_name}</strong>
              <div>Your role: {c.role}</div>
            </div>
          ))}
        </div>
      )}

      {/* Join church */}
      <div>
        <h3>Join a Church</h3>
        <form onSubmit={joinChurch} style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Church ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
          />
          <button type="submit">Join</button>
        </form>
      </div>

      {/* Create church */}
      <div>
        <h3>Create a New Church</h3>
        <form onSubmit={createChurch} style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Church Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            placeholder="Location (optional)"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
          />
          <button type="submit">Create Church</button>
        </form>
      </div>
    </div>
  );
}
