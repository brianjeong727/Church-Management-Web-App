// src/pages/SignupMember.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupMember() {
  const nav = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Member Registration
        </h1>

        <div className="space-y-4">

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

          <button
            onClick={() =>
              nav("/signup/member/church", {
                state: { fullName, email, password }
              })
            }
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Next: Choose Church
          </button>

        </div>
      </div>
    </div>
  );
}
