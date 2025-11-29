// src/pages/SignupChurch.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function SignupChurch() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    churchName: "",
    location: "",
    denomination: "",
    size: "",
    fullName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      await axios.post(`${BASE}/auth/register_church/`, {
        church_name: form.churchName,
        location: form.location,
        denomination: form.denomination,
        size: Number(form.size),
        full_name: form.fullName,
        email: form.email,
        password: form.password,
      });

      nav("/login");
    } catch (err) {
      const data = err.response?.data;

      if (!data) {
        setError("Unable to complete signup. Please try again.");
      } else if (typeof data === "object") {
        const first = Object.keys(data)[0];
        setError(data[first]?.[0] || "Signup failed");
      } else {
        setError("Signup failed");
      }
    }

    setLoading(false);
  }

  return (
    <div
      className="
        min-h-screen flex items-center justify-center px-4 py-10
        bg-gradient-to-b from-[#3F1D97] to-[#1A0952]
      "
    >
      {/* GLASS CARD */}
      <div
        className="
          w-full max-w-xl p-10 rounded-2xl
          bg-white/10 backdrop-blur-xl
          border border-white/20 shadow-2xl
        "
      >
        {/* Header */}
        <h1 className="text-3xl font-bold text-white text-center">
          Register Your Church
        </h1>
        <p className="text-center text-white/70 mt-2 mb-8">
          Create your church profile and pastor account.
        </p>

        {/* Error Box */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">

          {/* --- CHURCH SECTION --- */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">
              Church Information
            </h2>

            <div className="space-y-4">
              <input
                className="input bg-white/20 text-white placeholder-white/60"
                placeholder="Church Name"
                value={form.churchName}
                onChange={(e) => update("churchName", e.target.value)}
              />

              <input
                className="input bg-white/20 text-white placeholder-white/60"
                placeholder="Location"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
              />

              <input
                className="input bg-white/20 text-white placeholder-white/60"
                placeholder="Denomination (e.g., Protestant)"
                value={form.denomination}
                onChange={(e) => update("denomination", e.target.value)}
              />

              <input
                type="number"
                className="input bg-white/20 text-white placeholder-white/60"
                placeholder="Approx. Congregation Size"
                value={form.size}
                onChange={(e) => update("size", e.target.value)}
              />
            </div>
          </div>

          <hr className="border-white/20" />

          {/* --- PASTOR SECTION --- */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">
              Pastor Account
            </h2>

            <div className="space-y-4">
              <input
                className="input bg-white/20 text-white placeholder-white/60"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />

              <input
                className="input bg-white/20 text-white placeholder-white/60"
                placeholder="Email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />

              <input
                type="password"
                className="input bg-white/20 text-white placeholder-white/60"
                placeholder="Password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              w-full py-3 rounded-xl font-semibold
              bg-gradient-to-r from-purple-500 to-fuchsia-500
              text-white shadow-lg
              hover:opacity-90 transition
              disabled:opacity-40 disabled:cursor-not-allowed mt-4
            "
          >
            {loading ? "Creating..." : "Create Church + Pastor Account"}
          </button>

        </div>
      </div>
    </div>
  );
}
