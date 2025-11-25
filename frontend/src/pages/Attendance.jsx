// src/pages/Attendance.jsx
import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Attendance() {
  const { user } = useAuth();
  const isLeader =
    user?.role === "pastor" || user?.role === "deacon";

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // Load events once
  useEffect(() => {
    client
      .get("events/")
      .then((res) => setEvents(res.data))
      .catch(() => setError("Failed to load events."));
  }, []);

  // Load attendance when event changes
  useEffect(() => {
    if (!eventId) return;
    client
      .get(`attendance/?event=${eventId}`)
      .then((res) => setRows(res.data))
      .catch(() => setError("Failed to load attendance."));
  }, [eventId]);

  async function checkIn() {
    try {
      await client.post("attendance/", {
        event: Number(eventId),
        status: "in",
      });
      const res = await client.get(`attendance/?event=${eventId}`);
      setRows(res.data);
    } catch {
      setError("Failed to check in.");
    }
  }

  const selectedEvent = events.find(
    (e) => String(e.id) === String(eventId)
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Attendance</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Event dropdown */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Event</label>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Choose event…</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance table */}
      {eventId && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            {selectedEvent?.title}
          </h2>

          <div className="overflow-x-auto shadow border rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left border-b">Name</th>
                  <th className="py-2 px-3 text-left border-b">Status</th>
                  <th className="py-2 px-3 text-left border-b">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-4 text-gray-500"
                    >
                      (No attendance yet)
                    </td>
                  </tr>
                )}

                {rows.map((r) => (
                  <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                    <td className="py-2 px-3 border-b">
                      {r.user?.full_name || r.user?.email}
                    </td>
                    <td className="py-2 px-3 border-b capitalize">
                      {r.status}
                    </td>
                    <td className="py-2 px-3 border-b">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Check-in button for members ONLY */}
          {!isLeader && (
            <button
              onClick={checkIn}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700"
            >
              Check In
            </button>
          )}
        </>
      )}
    </div>
  );
}
