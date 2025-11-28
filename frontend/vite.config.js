import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    transformer: "postcss", // force Vite to use PostCSS instead of LightningCSS
  },
});
