// src/pages/Signup.jsx
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md text-center">
        
        <h1 className="text-3xl font-bold mb-6">Create an Account</h1>

        <p className="text-gray-600 mb-8">
          Choose how you want to sign up:
        </p>

        <div className="flex flex-col gap-4">

          <button
            onClick={() => nav("/signup/church")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Register My Church
          </button>

          <button
            onClick={() => nav("/signup/member")}
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900"
          >
            Join an Existing Church
          </button>

        </div>
      </div>
    </div>
  );
}
