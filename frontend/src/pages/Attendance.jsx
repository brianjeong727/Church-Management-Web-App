import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Attendance() {
  const { user } = useAuth();
  const isLeader = user?.role === "pastor" || user?.role === "deacon";

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // Load events
  useEffect(() => {
    client
      .get("events/")
      .then((res) => setEvents(res.data))
      .catch(() => setError("Failed to load events."));
  }, []);

  // Load attendance for selected event
  useEffect(() => {
    if (!eventId) return;

    client
      .get(`events/${eventId}/attendance/`)
      .then((res) => {
        if (isLeader) {
          // Leaders get full list (array)
          setRows(Array.isArray(res.data) ? res.data : []);
        } else {
          // Members get only their own record
          if (!res.data?.signed_up) {
            setRows([]); // not checked in
          } else {
            setRows([
              {
                id: 0,
                user: { full_name: user.full_name, email: user.email },
                status: res.data.status,
                timestamp: res.data.timestamp,
              },
            ]);
          }
        }
      })
      .catch(() => setError("Failed to load attendance."));
  }, [eventId, isLeader, user]);

  // Member check-in
  async function checkIn() {
    try {
      await client.post(`events/${eventId}/attendance/`, {
        status: "in",
      });

      // reload
      const res = await client.get(`events/${eventId}/attendance/`);
      if (isLeader) {
        setRows(Array.isArray(res.data) ? res.data : []);
      } else {
        setRows([
          {
            id: 0,
            user: { full_name: user.full_name, email: user.email },
            status: res.data.status,
            timestamp: res.data.timestamp,
          },
        ]);
      }
    } catch {
      setError("Failed to check in.");
    }
  }

  const selectedEvent = events.find(
    (e) => String(e.id) === String(eventId)
  );

  const totalCount = rows.length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Attendance</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

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

      {eventId && (
        <>
          <h2 className="text-xl font-semibold mb-3">
            {selectedEvent?.title}
          </h2>

          {isLeader && (
            <p className="mb-3 text-gray-700 font-medium">
              Total Checked In: {totalCount}
            </p>
          )}

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

                {rows.map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50">
                    <td className="py-2 px-3 border-b">
                      {r.user?.full_name || r.user?.email}
                    </td>
                    <td className="py-2 px-3 border-b capitalize">
                      {r.status}
                    </td>
                    <td className="py-2 px-3 border-b">
                      {r.timestamp
                        ? new Date(r.timestamp).toLocaleString()
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
