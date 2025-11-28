/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        linen: "#F7F3ED",
        stone: "#E8E4DB",
        midnight: "#1C1A27",
      },
      boxShadow: {
        glow: "0 0 12px rgba(232, 193, 114, 0.45)",
        soft: "0 2px 6px rgba(0,0,0,0.08)",
      },
      fontFamily: {
        display: ['"Inter"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
