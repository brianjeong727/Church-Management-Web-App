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

  // ---------------------------------------------------
  // LOAD EVENTS
  // ---------------------------------------------------
  useEffect(() => {
    client
      .get("events/")
      .then((res) => setEvents(res.data))
      .catch(() => setError("Failed to load events."));
  }, []);

  // ---------------------------------------------------
  // LOAD ATTENDANCE BASED ON USER ROLE
  // ---------------------------------------------------
  useEffect(() => {
    if (!eventId) return;

    client
      .get(`events/${eventId}/attendance/`)
      .then((res) => {
        if (isLeader) {
          setRows(Array.isArray(res.data) ? res.data : []);
        } else {
          if (!res.data?.signed_up) {
            setRows([]);
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

  // ---------------------------------------------------
  // MEMBER CHECK-IN
  // ---------------------------------------------------
  async function checkIn() {
    try {
      await client.post(`events/${eventId}/attendance/`, { status: "in" });

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

  const selectedEvent = events.find((e) => String(e.id) === String(eventId));
  const totalCount = rows.length;

  return (
    <div className="min-h-screen px-6 py-10 bg-[linear-gradient(180deg,#3b0764,#1e1b4b)] text-white">

      {/* HEADER */}
      <div className="text-center mb-10 animate-fadeIn">
        <h1 className="text-4xl font-extrabold tracking-wide">Attendance</h1>
        <p className="text-purple-200 mt-2 text-lg">
          Track participation and celebrate community presence.
        </p>
      </div>

      {error && (
        <p className="text-red-300 text-center font-medium mb-4 animate-fadeIn">
          {error}
        </p>
      )}

      {/* EVENT SELECTOR */}
      <div className="max-w-xl mx-auto mb-10 animate-fadeIn">
        <label className="block mb-2 text-purple-200 font-medium">
          Select an Event
        </label>

        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
          text-white backdrop-blur-xl focus:bg-white/20 transition outline-none"
        >
          <option value="">Choose event…</option>
          {events.map((e) => (
            <option key={e.id} value={e.id} className="text-black">
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {/* SHOW TABLE ONLY IF EVENT SELECTED */}
      {eventId && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">

          {/* EVENT TITLE */}
          <h2 className="text-2xl font-bold text-center mb-4">
            {selectedEvent?.title}
          </h2>

          {/* LEADER COUNT */}
          {isLeader && (
            <p className="text-center mb-4 text-purple-200 font-medium">
              Total Checked In: <span className="text-white">{totalCount}</span>
            </p>
          )}

          {/* TABLE */}
          <div
            className="overflow-x-auto bg-white/10 border border-white/20 
            rounded-2xl shadow-xl backdrop-blur-xl animate-fadeIn"
          >
            <table className="w-full border-collapse text-white">
              <thead className="bg-white/10">
                <tr>
                  <th className="py-3 px-4 border-b border-white/20 text-left">
                    Name
                  </th>
                  <th className="py-3 px-4 border-b border-white/20 text-left">
                    Status
                  </th>
                  <th className="py-3 px-4 border-b border-white/20 text-left">
                    Timestamp
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-6 text-purple-200"
                    >
                      (No attendance yet)
                    </td>
                  </tr>
                )}

                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className="odd:bg-white/5 even:bg-white/0 transition"
                  >
                    <td className="py-3 px-4 border-b border-white/10">
                      {r.user?.full_name || r.user?.email}
                    </td>

                    <td className="py-3 px-4 border-b border-white/10 capitalize">
                      {r.status}
                    </td>

                    <td className="py-3 px-4 border-b border-white/10">
                      {r.timestamp
                        ? new Date(r.timestamp).toLocaleString()
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MEMBER CHECK-IN BUTTON */}
          {!isLeader && (
            <div className="text-center">
              <button
                onClick={checkIn}
                className="px-6 py-3 bg-purple-600/70 rounded-lg border border-white/20 
                font-semibold text-white hover:bg-purple-600 transition shadow"
              >
                Check In
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
