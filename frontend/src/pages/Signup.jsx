import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE = "http://127.0.0.1:8000/api";

export default function Signup() {
  const nav = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [churches, setChurches] = useState([]);
  const [churchId, setChurchId] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    axios.get(`${BASE}/churches/`).then((res) => setChurches(res.data));
  }, []);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(`${BASE}/signup/`, {
        full_name: fullName,
        email,
        password,
        church_id: churchId,
        role,
      });

      setSuccess("Account created! You may now log in.");
      setTimeout(() => nav("/login"), 1200);
    } catch (err) {
        console.log("Signup error:", err.response?.data);

        const data = err.response?.data;
        let msg = "Signup failed";

        if (typeof data === "string") {
            msg = data;
        } else if (data?.error) {
            msg = data.error;
        } else if (data?.detail) {
            msg = data.detail;
        } else if (data?.email) {
            msg = data.email;  // <— THIS is the backend duplicate email error
        }

        setError(msg);
        }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Create an Account
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <form className="space-y-4" onSubmit={handleSignup}>
          <input
            placeholder="Full Name"
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
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Church dropdown */}
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={churchId}
            onChange={(e) => setChurchId(e.target.value)}
          >
            <option value="">Select Church</option>
            {churches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Role dropdown */}
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="member">Member</option>
            <option value="deacon">Deacon</option>
            <option value="pastor">Pastor</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
