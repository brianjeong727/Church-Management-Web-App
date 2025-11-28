// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ✨ PRIMARY THEME COLORS — Biblical + Modern ✨
        royal: {
          light: "#8D6BE8",
          DEFAULT: "#6F47D6",
          dark: "#5233A3",
        },
        crimson: {
          light: "#D85863",
          DEFAULT: "#C03546",
          dark: "#8F2734",
        },
        gold: {
          light: "#F3DCA4",
          DEFAULT: "#E8C172",
          dark: "#C49F51",
        },

        // ✨ NEUTRALS (Premium + Sacred Visual Vibe) ✨
        linen: "#F7F3ED",     // soft holy parchment
        stone: "#E8E4DB",     // clean neutral for cards/sections
        midnight: "#1C1A27",  // deep ink — perfect text/headers
      },

      // Optional: soft shadow + font upgrades for a divine feel
      boxShadow: {
        glow: "0 0 12px rgba(232, 193, 114, 0.45)", // gold glow
        soft: "0 2px 6px rgba(0,0,0,0.08)",         // subtle card shadow
      },

      fontFamily: {
        display: ['"Inter"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
