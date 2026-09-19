import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    target: "esnext",
    cssCodeSplit: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Three.js – deferred via requestIdleCallback, safe to split
          if (id.includes("three")) return "vendor-three";
          // Supabase – large but needed everywhere; split so React core loads first
          if (id.includes("@supabase")) return "vendor-supabase";
          // React + React-DOM core
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          )
            return "vendor-react";
          // GSAP – dynamically imported in animations.ts & flyHeartToCart.ts
          if (id.includes("gsap")) return "vendor-gsap";
          // Motion library
          if (id.includes("motion")) return "vendor-motion";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
