// src/pages/SignupChurch.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE = "http://127.0.0.1:8000/api";

export default function SignupChurch() {
  const nav = useNavigate();

  const [churchName, setChurchName] = useState("");
  const [location, setLocation] = useState("");
  const [denomination, setDenomination] = useState("");
  const [size, setSize] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  async function handleSubmit() {
    try {
      await axios.post(`${BASE}/auth/register_church/`, {
        church_name: churchName,
        location,
        denomination,
        size: Number(size),
        full_name: fullName,
        email,
        password,
      });

      nav("/login");
    } catch (err) {
        const data = err.response?.data;

        if (!data) {
            setError("Signup failed");
            return;
        }

        // If DRF returns field errors like { email: ["..."], church_name: ["..."] }
        if (typeof data === "object") {
            const firstKey = Object.keys(data)[0];
            const message = data[firstKey]?.[0];
            setError(message || "Signup failed");
            return;
        }

        setError("Signup failed");
    }

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Register Your Church
        </h1>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <div className="space-y-4">

          <input
            placeholder="Church Name"
            className="w-full border rounded-lg px-3 py-2"
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
          />

          <input
            placeholder="Location"
            className="w-full border rounded-lg px-3 py-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            placeholder="Denomination (e.g., Protestant)"
            className="w-full border rounded-lg px-3 py-2"
            value={denomination}
            onChange={(e) => setDenomination(e.target.value)}
          />

          <input
            placeholder="Approx. Congregation Size"
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />

          <hr className="my-4" />

          <input
            placeholder="Your Full Name (Pastor)"
            className="w-full border rounded-lg px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Password"
            type="password"
            className="w-full border rounded-lg px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Create Church + Pastor Account
          </button>

        </div>
      </div>
    </div>
  );
}
