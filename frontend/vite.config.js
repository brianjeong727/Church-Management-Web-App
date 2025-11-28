import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    transformer: "postcss",   // ⛔ force PostCSS instead of LightningCSS
    postcss: "./postcss.config.js",
  },
  optimizeDeps: {
    exclude: ["lightningcss"], // ⛔ don't ever load lightningcss
  },
});
