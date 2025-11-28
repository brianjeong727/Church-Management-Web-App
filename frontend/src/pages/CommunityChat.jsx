export default function CommunityChat() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center 
      bg-[linear-gradient(180deg,#3b0764,#312e81)] text-white px-6 py-10">

      {/* Icon */}
      <div className="mb-6 w-20 h-20 bg-white/10 border border-white/20 
        rounded-2xl backdrop-blur-xl shadow-xl flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth="1.7" 
          stroke="white"
          className="w-10 h-10 opacity-90"
        >
          <path 
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8h10M7 12h6M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.83L3 20l1.37-3.66A7.82 7.82 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-3 tracking-wide text-center">
        Community Chat
      </h1>

      {/* Subtitle */}
      <p className="text-purple-200 text-lg text-center max-w-md">
        A space for your church members to connect, share, and encourage one another.
      </p>

      {/* Coming Soon Card */}
      <div className="mt-8 bg-white/10 border border-white/20 
        backdrop-blur-xl rounded-2xl shadow-xl px-8 py-6 text-center max-w-lg">

        <p className="text-purple-200 text-lg font-medium mb-1">
          Coming Soon
        </p>
        <p className="text-purple-300">
          We’re building a real-time chat experience for your community.
        </p>
      </div>
    </div>
  );
}
