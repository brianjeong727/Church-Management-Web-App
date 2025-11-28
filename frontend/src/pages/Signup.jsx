// src/pages/Signup.jsx
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#3b0764,#312e81)] px-6">
      <div className="bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-full max-w-md text-center border border-white/20">

        {/* Cross icon */}
        <div className="mx-auto mb-6 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-inner">
          <div className="w-6 h-6 border-2 border-white absolute rotate-0"
               style={{ borderLeft: "none", borderBottom: "none" }}
          ></div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
          Create an Account
        </h1>

        <p className="text-purple-100/90 text-lg mb-10 leading-relaxed">
          Begin your journey with{" "}
          <span className="font-semibold text-white">Central</span>.
        </p>

        <div className="flex flex-col gap-5">

          {/* Register Church */}
          <button
            onClick={() => nav("/signup/church")}
            className="
              w-full py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-purple-600 to-purple-800
              hover:from-purple-700 hover:to-purple-900
              shadow-lg hover:shadow-purple-500/40
              transition-all duration-300
            "
          >
            Register My Church
          </button>

          {/* Join Church */}
          <button
            onClick={() => nav("/signup/member")}
            className="
              w-full py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-rose-500 to-rose-700
              hover:from-rose-600 hover:to-rose-800
              shadow-lg hover:shadow-rose-400/40
              transition-all duration-300
            "
          >
            Join an Existing Church
          </button>

        </div>
      </div>
    </div>
  );
}
