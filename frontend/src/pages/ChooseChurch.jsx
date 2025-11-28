// src/pages/ChooseChurch.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const BASE = "http://127.0.0.1:8000/api";

export default function ChooseChurch() {
  const nav = useNavigate();
  const { state } = useLocation(); 

  // If user got here without step 1, redirect
  if (!state) {
    nav("/signup/member");
  }

  const { fullName, email, password } = state;

  const [churches, setChurches] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${BASE}/churches/`).then((res) => setChurches(res.data));
  }, []);

  async function submitSignup(church_id) {
    try {
      await axios.post(`${BASE}/auth/register_member/`, {
        full_name: fullName,
        email,
        password,
        church_id,
      });

      nav("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  }

  const filtered = churches.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Choose Your Church</h1>

        <input
          placeholder="Search churches..."
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => submitSignup(c.id)}
              className="w-full border p-3 rounded-lg text-left hover:bg-gray-100"
            >
              <strong>{c.name}</strong>
              <div className="text-gray-600 text-sm">{c.location}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
