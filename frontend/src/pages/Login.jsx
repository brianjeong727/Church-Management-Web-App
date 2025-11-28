import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 
      bg-[linear-gradient(180deg,#3b0764,#312e81)] text-white">
      
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl 
        rounded-2xl p-10 w-full max-w-md text-center animate-fadeIn">
        
        {/* Cross Icon */}
        <div className="mx-auto mb-6 w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
          <div
            className="w-7 h-7 border-2 border-white rotate-0"
            style={{ borderLeft: "none", borderBottom: "none" }}
          ></div>
        </div>

        <h1 className="text-3xl font-extrabold mb-2 tracking-wide">Central Login</h1>
        <p className="text-purple-200 mb-8">Welcome back to your community center.</p>

        {error && (
          <p className="text-red-300 font-medium mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email */}
          <div className="text-left text-white">
            <label className="block mb-1 font-semibold">Email</label>
            <input
              type="email"
              className="w-full px-3 py-3 rounded-lg bg-white/20 text-white 
                placeholder-purple-200 border border-white/30 
                focus:ring-2 focus:ring-purple-400 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="text-left text-white">
            <label className="block mb-1 font-semibold">Password</label>
            <input
              type="password"
              className="w-full px-3 py-3 rounded-lg bg-white/20 text-white 
                placeholder-purple-200 border border-white/30 
                focus:ring-2 focus:ring-purple-400 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold 
              hover:bg-purple-700 transition shadow-lg shadow-purple-900/30 
              disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
